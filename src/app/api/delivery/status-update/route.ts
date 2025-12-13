// src/app/api/delivery/status-update/route.ts

/**
 * Delivery Status Update API
 * ---------------------------------------------------------
 * POST /api/delivery/status-update
 *
 * Allows updating the delivery status of a product.
 *
 * Status Flow:
 * PENDING → REQUESTED → PICKED_UP → DELIVERED_PAID
 *
 * Body:
 * {
 *   productId: string,
 *   status: "PICKED_UP" | "DELIVERED_PAID" | "CANCELLED"
 * }
 *
 * Access:
 * - In production: Ahmad Delivery service (with API key)
 * - For now: Seller or Admin can update
 */

import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { sendEmail } from "@/lib/mail";

export async function POST(request: NextRequest) {
  try {
    // Step 1: Authenticate user
    const authUser = getAuthUser(request);
    if (!authUser) {
      return NextResponse.json(
        { message: "Unauthorized. Please log in." },
        { status: 401 }
      );
    }

    // Step 2: Parse request body
    const body = await request.json();
    const { productId, status } = body;

    if (!productId || !status) {
      return NextResponse.json(
        { message: "Missing required fields: productId, status" },
        { status: 400 }
      );
    }

    // Validate status
    const validStatuses = ["PICKED_UP", "DELIVERED_PAID", "CANCELLED"];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        {
          message: `Invalid status. Must be one of: ${validStatuses.join(
            ", "
          )}`,
        },
        { status: 400 }
      );
    }

    // Step 3: Fetch product with relations
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        seller: {
          include: {
            profile: true,
          },
        },
        winner: {
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

    // Step 4: Verify authorization (seller or admin can update)
    const isSeller = product.sellerId === authUser.userId;
    const isAdmin = authUser.role === "ADMIN";

    if (!isSeller && !isAdmin) {
      return NextResponse.json(
        {
          message:
            "Forbidden. Only seller or admin can update delivery status.",
        },
        { status: 403 }
      );
    }

    // Step 5: Update delivery status
    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: {
        deliveryStatus: status as "PICKED_UP" | "DELIVERED_PAID" | "CANCELLED",
        ...(status === "DELIVERED_PAID" && { isPaid: true }),
      },
    });

    // Step 6: Send confirmation email when delivered
    if (status === "DELIVERED_PAID" && product.winner && product.seller) {
      // Email to winner
      if (product.winner.email) {
        await sendEmail({
          to: product.winner.email,
          subject: `✅ Delivery Confirmed: ${product.title}`,
          html: `
            <h2>Delivery Confirmed</h2>
            <p>Your item <strong>${product.title}</strong> has been delivered successfully.</p>
            <p>Thank you for using Digital Auction Platform!</p>
          `,
        });
      }

      // Email to seller
      if (product.seller.email) {
        await sendEmail({
          to: product.seller.email,
          subject: `💰 Payment Received: ${product.title}`,
          html: `
            <h2>Payment Received</h2>
            <p>Your item <strong>${
              product.title
            }</strong> has been delivered and payment confirmed.</p>
            <p><strong>Your payout:</strong> $${product.sellerPayout?.toFixed(
              2
            )}</p>
            <p>The funds will be transferred to your account shortly.</p>
            <p>Thank you for using Digital Auction Platform!</p>
          `,
        });
      }
    }

    console.log(`✅ Delivery status updated: ${product.title} → ${status}`);

    return NextResponse.json(
      {
        message: "Delivery status updated successfully",
        product: {
          id: updatedProduct.id,
          title: updatedProduct.title,
          deliveryStatus: updatedProduct.deliveryStatus,
          isPaid: updatedProduct.isPaid,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Update delivery status error:", error);
    return NextResponse.json(
      { message: "Failed to update delivery status" },
      { status: 500 }
    );
  }
}
