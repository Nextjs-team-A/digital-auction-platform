// src/app/api/products/[id]/route.ts

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAuthUser } from "@/lib/auth";
import { UpdateProductSchema } from "@/utils/validationSchema";
import type { UpdateProductDTO } from "@/utils/dto";

/**
 * GET /api/products/[id]
 * ---------------------------------------------------------
 * Return a single product by ID.
 */
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const product = await prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      return NextResponse.json(
        { message: "Product not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(product, { status: 200 });
  } catch (error) {
    console.error("GET PRODUCT ERROR:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

/**
 * PUT /api/products/[id]
 * ---------------------------------------------------------
 * Supports TWO operations:
 *
 * 1. Product update (seller/admin only)
 *    Body example:
 *    { title, description, images, auctionEnd, location }
 *
 * 2. Bidding (authenticated bidders)
 *    Body example:
 *    { bidAmount: 150 }
 *
 * System auto-detects which operation is being performed.
 */
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  const authUser = getAuthUser(request);
  if (!authUser) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const product = await prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      return NextResponse.json(
        { message: "Product not found" },
        { status: 404 }
      );
    }

    const body = await request.json();

    /* -------------------------------------------------------
       CASE 1: BIDDING
       Detect if request contains bidAmount
    ------------------------------------------------------- */
    if (body.bidAmount !== undefined) {
      const bidAmount = Number(body.bidAmount);

      if (isNaN(bidAmount) || bidAmount <= 0) {
        return NextResponse.json(
          { message: "Invalid bid amount" },
          { status: 400 }
        );
      }

      if (bidAmount <= product.currentBid) {
        return NextResponse.json(
          { message: "Bid must be higher than current bid" },
          { status: 400 }
        );
      }

      // Atomic transaction for safety
      const [newBid, updatedProduct] = await prisma.$transaction([
        prisma.bid.create({
          data: {
            productId: id,
            bidderId: authUser.userId,
            amount: bidAmount,
          },
        }),
        prisma.product.update({
          where: { id },
          data: {
            currentBid: bidAmount,
          },
        }),
      ]);

      return NextResponse.json(
        {
          message: "Bid placed successfully",
          bid: newBid,
          product: updatedProduct,
        },
        { status: 200 }
      );
    }

    /* -------------------------------------------------------
       CASE 2: PRODUCT UPDATE (Seller/Admin only)
    ------------------------------------------------------- */

    const isOwner = product.sellerId === authUser.userId;
    const isAdmin = authUser.role === "ADMIN";

    if (!isOwner && !isAdmin) {
      return NextResponse.json(
        { message: "Forbidden: you cannot edit this product" },
        { status: 403 }
      );
    }

    const normalizedBody: Partial<UpdateProductDTO> = {
      ...body,
    };

    // Normalize auctionEnd string → Date
    if (
      normalizedBody.auctionEnd &&
      typeof normalizedBody.auctionEnd === "string"
    ) {
      normalizedBody.auctionEnd = new Date(normalizedBody.auctionEnd);
    }

    const parsed = UpdateProductSchema.safeParse(normalizedBody);
    if (!parsed.success) {
      return NextResponse.json(
        {
          message: "Validation failed",
          errors: parsed.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const data = parsed.data;

    const updatedProduct = await prisma.product.update({
      where: { id },
      data: {
        title: data.title ?? product.title,
        description: data.description ?? product.description,
        images: data.images ?? product.images,
        startingBid: data.startingBid ?? product.startingBid,
        auctionEnd: data.auctionEnd ?? product.auctionEnd,
        location: data.location ?? product.location,
      },
    });

    return NextResponse.json(updatedProduct, { status: 200 });
  } catch (error) {
    console.error("UPDATE PRODUCT ERROR:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

/**
 * DELETE /api/products/[id]
 * ---------------------------------------------------------
 * Only seller or admin may delete.
 */
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  const authUser = getAuthUser(request);
  if (!authUser) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const product = await prisma.product.findUnique({ where: { id } });

    if (!product) {
      return NextResponse.json(
        { message: "Product not found" },
        { status: 404 }
      );
    }

    const isOwner = product.sellerId === authUser.userId;
    const isAdmin = authUser.role === "ADMIN";

    if (!isOwner && !isAdmin) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    await prisma.product.delete({ where: { id } });

    return NextResponse.json(
      { message: "Product deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("DELETE PRODUCT ERROR:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
