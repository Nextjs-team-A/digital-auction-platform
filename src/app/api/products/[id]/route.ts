// src/app/api/products/[id]/route.ts

/**
 * Product by ID API
 * ---------------------------------------------------------
 * Handles operations on a single product:
 *
 *  - GET    /api/products/[id]  → return product by ID
 *  - PUT    /api/products/[id]  → update a product
 *  - DELETE /api/products/[id]  → delete a product
 *
 * Requirements:
 *  - Return 404 if product not found
 *  - Use Prisma Product model
 *  - Validate PUT body with UpdateProductSchema
 *  - Only the seller (or ADMIN) can update/delete
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAuthUser } from "@/lib/auth";
import { UpdateProductSchema } from "@/utils/validationSchema";
import type { UpdateProductDTO } from "@/utils/dto";

/**
 * GET /api/products/[id]
 * ---------------------------------------------------------
 * Return a single product by ID.
 *  - 200: product JSON
 *  - 404: if not found
 */
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params; // ✅ FIXED: await params

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
    console.error("GET PRODUCT BY ID ERROR:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

/**
 * PUT /api/products/[id]
 * ---------------------------------------------------------
 * Update an existing product.
 *
 * Rules:
 *  - Must be authenticated
 *  - Must be the product seller OR ADMIN
 *  - Validate body with UpdateProductSchema
 *  - 404 if product not found
 */
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params; // ✅ FIXED: await params

  // 1️⃣ Ensure user is authenticated
  const authUser = getAuthUser(request);
  if (!authUser) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    // 2️⃣ Ensure product exists first
    const existingProduct = await prisma.product.findUnique({
      where: { id },
    });

    if (!existingProduct) {
      return NextResponse.json(
        { message: "Product not found" },
        { status: 404 }
      );
    }

    // 3️⃣ Authorization: only seller or ADMIN may update
    const isOwner = existingProduct.sellerId === authUser.userId;
    const isAdmin = authUser.role === "ADMIN";

    if (!isOwner && !isAdmin) {
      return NextResponse.json(
        { message: "Forbidden: you cannot edit this product" },
        { status: 403 }
      );
    }

    // 4️⃣ Parse and validate request body
    const rawBody = (await request.json()) as Partial<UpdateProductDTO>;

    // Handle auctionEnd being sent as string by frontend:
    const normalizedBody: Partial<UpdateProductDTO> & {
      auctionEnd?: Date | string;
    } = {
      ...rawBody,
    };
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

    // 5️⃣ Update product with validated data
    const updatedProduct = await prisma.product.update({
      where: { id },
      data: {
        title: data.title ?? existingProduct.title,
        description: data.description ?? existingProduct.description,
        images: data.images ?? existingProduct.images,
        startingBid: data.startingBid ?? existingProduct.startingBid,
        auctionEnd: data.auctionEnd ?? existingProduct.auctionEnd,
        location: data.location ?? existingProduct.location,
      },
    });

    return NextResponse.json(updatedProduct, { status: 200 });
  } catch (error) {
    console.error("UPDATE_PRODUCT_ERROR:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

/**
 * DELETE /api/products/[id]
 * ---------------------------------------------------------
 * Delete an existing product.
 *
 * Rules:
 *  - Must be authenticated
 *  - Must be the product seller OR ADMIN
 *  - 404 if product not found
 */
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params; // ✅ FIXED: await params

  // 1️⃣ Ensure user is authenticated
  const authUser = getAuthUser(request);
  if (!authUser) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    // 2️⃣ Ensure product exists first
    const existingProduct = await prisma.product.findUnique({
      where: { id },
    });

    if (!existingProduct) {
      return NextResponse.json(
        { message: "Product not found" },
        { status: 404 }
      );
    }

    // 3️⃣ Authorization: only seller or ADMIN may delete
    const isOwner = existingProduct.sellerId === authUser.userId;
    const isAdmin = authUser.role === "ADMIN";

    if (!isOwner && !isAdmin) {
      return NextResponse.json(
        { message: "Forbidden: you cannot delete this product" },
        { status: 403 }
      );
    }

    // 4️⃣ Delete product
    await prisma.product.delete({
      where: { id },
    });

    return NextResponse.json(
      { message: "Product deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("DELETE_PRODUCT_ERROR:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
