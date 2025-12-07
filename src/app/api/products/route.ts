// src/app/api/products/route.ts
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
 */
export async function POST(request: Request) {
  try {
    // --- Extract token from Cookie header ---
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

    // --- Verify token (returns payload or null) ---
    const decoded = verifyToken(token) as JwtPayload | null;
    if (!decoded) {
      return NextResponse.json(
        { message: "Invalid or expired token, please log in again" },
        { status: 401 }
      );
    }

    // decoded has shape { userId, email, role }
    const sellerId = decoded.userId;

    // --- Parse JSON body ---
    const body = await request.json();

    // Validate with Zod (CreateProductSchema expects proper types)
    const validation = CreateProductSchema.safeParse(body);
    if (!validation.success) {
      // Return the first Zod message for simplicity
      const firstIssueMessage =
        validation.error?.issues?.[0]?.message || "Validation failed";
      return NextResponse.json({ message: firstIssueMessage }, { status: 400 });
    }

    const data = validation.data as CreateProductDTO;

    // --- Create product in DB (matching your Prisma Product model) ---
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
        // other fields (winnerId, finalBidAmount, etc.) will remain null/ defaults
      },
    });

    return NextResponse.json(
      { message: "Product created successfully", product },
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
