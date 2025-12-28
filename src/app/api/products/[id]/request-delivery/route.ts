// src/app/api/products/[id]/request-delivery/route.ts

/**
 * Request Delivery API
 * ---------------------------------------------------------
 * POST /api/products/[id]/request-delivery
 *
 * Allows the seller to request delivery for a sold product.
 *
 * Flow:
 * 1. Verify the seller owns this product
 * 2. Verify the auction has ended and has a winner
 * 3. Update delivery status to "REQUESTED"
 * 4. (In production: Send request to Ahmad Delivery service)
 * 5. Return success confirmation
 *
 * Access: Seller only
 */

import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Step 1: Authenticate user
    const authUser = getAuthUser(request);
    if (!authUser) {
      return NextResponse.json(
        { message: "Unauthorized. Please log in." },
        { status: 401 }
      );
    }

    const { id: productId } = await params;

    // Step 2: Fetch the product with relations
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        winner: {
          include: {
            profile: true,
          },
        },
        seller: {
          include: {
            profile: true,
          },
        },
      },
    });

    if (!product) {
      return NextResponse.json(
        { message: "Product not found" },
        { status: 404 }
      );
    }

    // Step 3: Verify ownership (only seller can request delivery)
    if (product.sellerId !== authUser.userId) {
      return NextResponse.json(
        { message: "Forbidden. Only the seller can request delivery." },
        { status: 403 }
      );
    }

    // Step 4: Verify auction has ended
    if (product.status !== "ENDED") {
      return NextResponse.json(
        { message: "Cannot request delivery. Auction has not ended yet." },
        { status: 400 }
      );
    }

    // Step 5: Verify there is a winner
    if (!product.winnerId || !product.winner) {
      return NextResponse.json(
        { message: "Cannot request delivery. No winner for this auction." },
        { status: 400 }
      );
    }

    // Step 6: Check if delivery already requested
    if (
      product.deliveryStatus === "REQUESTED" ||
      product.deliveryStatus === "PICKED_UP" ||
      product.deliveryStatus === "DELIVERED_PAID"
    ) {
      return NextResponse.json(
        {
          message: "Delivery has already been requested for this product.",
          currentStatus: product.deliveryStatus,
        },
        { status: 400 }
      );
    }

    // Step 7: Update delivery status
    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: {
        deliveryStatus: "REQUESTED",
      },
    });

    // Step 8: In production, you would call Ahmad Delivery API here
    // Example:
    // await fetch('https://ahmad-delivery.com/api/requests', {
    //   method: 'POST',
    //   body: JSON.stringify({
    //     pickupAddress: product.seller.profile?.location,
    //     deliveryAddress: product.winner.profile?.location,
    //     itemDescription: product.title,
    //     amount: product.totalCollected,
    //   })
    // });

    console.log(`✅ Delivery requested for product: ${product.title}`);
    console.log(`   Seller: ${product.seller.email}`);
    console.log(`   Winner: ${product.winner.email}`);
    console.log(`   Amount to collect: $${product.totalCollected}`);

    return NextResponse.json(
      {
        message: "Delivery requested successfully",
        product: {
          id: updatedProduct.id,
          title: updatedProduct.title,
          deliveryStatus: updatedProduct.deliveryStatus,
          totalCollected: updatedProduct.totalCollected,
          sellerPayout: updatedProduct.sellerPayout,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Request delivery error:", error);
    return NextResponse.json(
      { message: "Failed to request delivery" },
      { status: 500 }
    );
  }
}
