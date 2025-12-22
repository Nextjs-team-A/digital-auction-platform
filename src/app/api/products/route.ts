// src/app/api/products/route.ts - UPDATED VERSION

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyToken, JwtPayload } from "@/lib/jwt";
import { CreateProductSchema } from "@/utils/validationSchema";
import type { CreateProductDTO } from "@/utils/dto";

/**
 * @method GET
 * @route /api/products
 * @route /api/products?my=true (get only user's products)
 * @desc Get all products or user's products
 * @access Public for all products, Private for my products
 */
export async function GET(request: Request) {
  try {
    // Check if requesting user's own products
    const { searchParams } = new URL(request.url);
    const myProducts = searchParams.get("my") === "true";

    let products;

    if (myProducts) {
      // Get authenticated user's products only
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
          { message: "Authentication required" },
          { status: 401 }
        );
      }

      const decoded = verifyToken(token) as JwtPayload | null;
      if (!decoded) {
        return NextResponse.json(
          { message: "Invalid or expired token" },
          { status: 401 }
        );
      }

      // Fetch only user's products
      products = await prisma.product.findMany({
        where: { sellerId: decoded.userId },
        orderBy: { auctionStart: "desc" },
      });
    } else {
      // Fetch all products (public) with optional search
      const query = searchParams.get("q");

      const whereClause = query
        ? {
            OR: [
              {
                title: { contains: query, mode: "insensitive" as const },
              },
              {
                description: { contains: query, mode: "insensitive" as const },
              },
            ],
          }
        : {};

      products = await prisma.product.findMany({
        where: whereClause,
        include: {
          seller: {
            select: {
              email: true,
              profile: {
                select: {
                  firstName: true,
                  lastName: true,
                  location: true,
                },
              },
            },
          },
        },
        orderBy: { auctionStart: "desc" },
      });
    }

    if (!products || products.length === 0) {
      return NextResponse.json(
        { message: "No products yet", products: [] },
        { status: 200 }
      );
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

    // 4️⃣ Convert auctionEnd string to Date if needed
    const normalizedBody = {
      ...body,
      auctionEnd: body.auctionEnd ? new Date(body.auctionEnd) : undefined,
    };

    console.log("Received body:", body);
    console.log("Normalized body:", normalizedBody);

    // 5️⃣ Validate with Zod
    const validation = CreateProductSchema.safeParse(normalizedBody);
    if (!validation.success) {
      console.error("Validation errors:", validation.error.flatten());
      return NextResponse.json(
        {
          message: "Validation failed",
          errors: validation.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const data = validation.data as CreateProductDTO;

    // 6️⃣ Create product in DB
    const product = await prisma.product.create({
      data: {
        sellerId: sellerId,
        title: data.title,
        description: data.description,
        images: data.images,
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
