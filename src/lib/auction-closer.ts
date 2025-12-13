// src/lib/auction-closer.ts

/**
 * Auction Closing Logic
 * ---------------------------------------------------------
 * Core business logic for closing expired auctions
 *
 * This module:
 * 1. Finds all expired auctions that haven't been closed yet
 * 2. Determines the winner (highest bidder)
 * 3. Calculates all financial values
 * 4. Updates product with winner and financial data
 * 5. Sends dual notifications (winner + seller)
 *
 * Called by: /api/cron/close-auctions (scheduled job)
 */

import { prisma } from "@/lib/db";
import { calculateFinancials, FinancialCalculation } from "@/lib/financial";
import { sendEmail, EmailTemplates } from "@/lib/mail";

/**
 * Close a single auction by product ID
 *
 * @param productId - The ID of the product/auction to close
 * @returns Success status and message
 */
export async function closeAuction(productId: string) {
  try {
    // Step 1: Fetch the product with all necessary relations
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        seller: {
          include: {
            profile: true,
          },
        },
        bids: {
          orderBy: {
            amount: "desc", // Get highest bid first
          },
          take: 1, // Only need the winning bid
          include: {
            bidder: {
              include: {
                profile: true,
              },
            },
          },
        },
      },
    });

    if (!product) {
      return { success: false, message: "Product not found" };
    }

    // Check if auction is actually expired
    if (new Date(product.auctionEnd) > new Date()) {
      return { success: false, message: "Auction has not ended yet" };
    }

    // Check if already closed
    if (product.status === "ENDED") {
      return { success: false, message: "Auction already closed" };
    }

    // Step 2: Check if there are any bids
    if (product.bids.length === 0 || product.currentBid === 0) {
      // No bids - just mark as ended and notify seller
      await prisma.product.update({
        where: { id: productId },
        data: {
          status: "ENDED",
        },
      });

      // Send "no bids" email to seller
      if (product.seller.email) {
        const emailData = EmailTemplates.auctionExpiredNoBids({
          sellerEmail: product.seller.email,
          sellerName:
            product.seller.profile?.firstName ||
            product.seller.email.split("@")[0],
          productTitle: product.title,
        });

        await sendEmail(emailData);
      }

      return {
        success: true,
        message: "Auction closed with no bids",
      };
    }

    // Step 3: Get the winning bid and winner
    const winningBid = product.bids[0];
    const winner = winningBid.bidder;

    // Get winner's location for delivery fee calculation
    const winnerLocation = winner.profile?.location || "Outside Beirut";

    // Step 4: Calculate all financial values
    const financials = calculateFinancials(
      product.currentBid, // Final bid amount
      winnerLocation
    );

    // Step 5: Update product with winner and financial data
    await prisma.product.update({
      where: { id: productId },
      data: {
        status: "ENDED",
        winnerId: winner.id,
        finalBidAmount: financials.finalBidAmount,
        deliveryFee: financials.deliveryFee,
        platformCommission: financials.platformCommission,
        totalCollected: financials.totalCollected,
        sellerPayout: financials.sellerPayout,
        deliveryStatus: "PENDING", // Initial delivery status
      },
    });

    // Step 6: Send dual notifications

    // A) Email to WINNER
    if (winner.email) {
      const winnerEmailData = EmailTemplates.auctionWon({
        winnerEmail: winner.email,
        winnerName: winner.profile?.firstName || winner.email.split("@")[0],
        productTitle: product.title,
        finalBidAmount: financials.finalBidAmount,
        deliveryFee: financials.deliveryFee,
        totalAmount: financials.totalCollected,
        sellerPhone: product.seller.profile?.phone || "N/A",
      });

      await sendEmail(winnerEmailData);
    }

    // B) Email to SELLER
    if (product.seller.email) {
      const sellerEmailData = EmailTemplates.auctionSold({
        sellerEmail: product.seller.email,
        sellerName:
          product.seller.profile?.firstName ||
          product.seller.email.split("@")[0],
        productTitle: product.title,
        finalBidAmount: financials.finalBidAmount,
        platformCommission: financials.platformCommission,
        sellerPayout: financials.sellerPayout,
        winnerName: winner.profile?.firstName || winner.email.split("@")[0],
        winnerPhone: winner.profile?.phone || "N/A",
      });

      await sendEmail(sellerEmailData);
    }

    return {
      success: true,
      message: `Auction closed successfully. Winner: ${winner.email}`,
      data: {
        winnerId: winner.id,
        financials,
      },
    };
  } catch (error) {
    console.error("Error closing auction:", error);
    return {
      success: false,
      message: "Failed to close auction",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Close all expired auctions
 * This is the main function called by the cron job
 *
 * @returns Summary of closed auctions
 */
export async function closeExpiredAuctions() {
  try {
    // Find all expired auctions that are still ACTIVE
    const expiredAuctions = await prisma.product.findMany({
      where: {
        auctionEnd: {
          lte: new Date(), // Auction end time is in the past
        },
        status: "ACTIVE", // Still marked as active
      },
      select: {
        id: true,
        title: true,
        auctionEnd: true,
      },
    });

    console.log(`Found ${expiredAuctions.length} expired auctions to close`);

    interface AuctionCloseResult {
      productId: string;
      productTitle: string;
      success: boolean;
      message: string;
      data?: {
        winnerId: string;
        financials: FinancialCalculation;
      };
      error?: string;
    }

    const results = {
      total: expiredAuctions.length,
      successful: 0,
      failed: 0,
      details: [] as AuctionCloseResult[],
    };

    // Close each auction one by one
    for (const auction of expiredAuctions) {
      console.log(`Closing auction: ${auction.title} (${auction.id})`);

      const result = await closeAuction(auction.id);

      if (result.success) {
        results.successful++;
      } else {
        results.failed++;
      }

      results.details.push({
        productId: auction.id,
        productTitle: auction.title,
        ...result,
      });
    }

    console.log(
      `Auction closing complete: ${results.successful} successful, ${results.failed} failed`
    );

    return results;
  } catch (error) {
    console.error("Error in closeExpiredAuctions:", error);
    throw error;
  }
}
