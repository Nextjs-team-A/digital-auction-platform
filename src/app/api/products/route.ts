// src/app/api/products/route.ts

/**
 * Products API
 * ---------------------------------------------------------
 * GET  /api/products  → Get all products
 * POST /api/products  → Create new product (with uploaded image URLs)
 */

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyToken, JwtPayload } from "@/lib/jwt";
import { CreateProductSchema } from "@/utils/validationSchema";
import type { CreateProductDTO } from "@/utils/dto";

/**
 * @method GET
 * @route /api/products
 * @desc Get all products
 * @access Public
 */
export async function GET() {
  try {
    const products = await prisma.product.findMany({
      orderBy: { auctionStart: "desc" },
    });

    if (!products || products.length === 0) {
      return NextResponse.json({ message: "No products yet" }, { status: 200 });
    }

    return NextResponse.json({ products }, { status: 200 });
  } catch (e) {
    console.error("Get products error:", e);
    return NextResponse.json(
      { message: "Failed to fetch products" },
      { status: 500 }
    );
  }
}

/**
 * @method POST
 * @route /api/products
 * @desc Create new product
 * @access Private (authenticated user)
 *
 * @body JSON with product data including image URLs from /api/upload
 */
export async function POST(request: Request) {
  try {
    // 1️⃣ Extract token from Cookie header
    const cookieHeader = request.headers.get("cookie") || "";
    const tokenCookie = cookieHeader
      .split(";")
      .map((c) => c.trim())
      .find((c) => c.startsWith("token="));
    const token = tokenCookie
      ? tokenCookie.split("=").slice(1).join("=")
      : null;

    if (!token) {
      return NextResponse.json(
        { message: "No token provided, please log in" },
        { status: 401 }
      );
    }

    // 2️⃣ Verify token
    const decoded = verifyToken(token) as JwtPayload | null;
    if (!decoded) {
      return NextResponse.json(
        { message: "Invalid or expired token, please log in again" },
        { status: 401 }
      );
    }

    const sellerId = decoded.userId;

    // 3️⃣ Parse JSON body
    const body = await request.json();

    // 4️⃣ Validate with Zod
    const validation = CreateProductSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        {
          message: "Validation failed",
          errors: validation.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const data = validation.data as CreateProductDTO;

    // 5️⃣ Create product in DB
    const product = await prisma.product.create({
      data: {
        sellerId: sellerId,
        title: data.title,
        description: data.description,
        images: data.images, // URLs from /api/upload
        startingBid: data.startingBid,
        currentBid: 0,
        auctionStart: new Date(),
        auctionEnd: data.auctionEnd,
        location: data.location,
      },
    });

    return NextResponse.json(
      {
        message: "Product created successfully",
        product,
      },
      { status: 201 }
    );
  } catch (e) {
    console.error("Create product error:", e);
    return NextResponse.json(
      { message: "Failed to create product" },
      { status: 500 }
    );
  }
}
