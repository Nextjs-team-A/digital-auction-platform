// src/app/api/products/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyToken, JwtPayload } from "@/lib/jwt";

/* ----------------------------------------------------------
   HELPERS
-----------------------------------------------------------*/

function getTokenFromCookieHeader(req: NextRequest): string | null {
  const cookieHeader = req.headers.get("cookie") || "";
  const tokenCookie = cookieHeader
    .split(";")
    .map((c) => c.trim())
    .find((c) => c.startsWith("token="));
  return tokenCookie ? tokenCookie.split("=").slice(1).join("=") : null;
}

function getUserId(decoded: JwtPayload | null): string | null {
  if (!decoded) return null;
  return (decoded as any).userId ?? (decoded as any).id ?? null;
}

/* ----------------------------------------------------------
   GET /api/products/[id]
-----------------------------------------------------------*/

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const product = await prisma.product.findUnique({
      where: { id: params.id },
    });

    if (!product) {
      return NextResponse.json({ message: "Not found" }, { status: 404 });
    }

    return NextResponse.json(
      {
        id: product.id,
        title: product.title,
        description: product.description,
        images: product.images,
        startingBid: product.startingBid,
        currentBid: product.currentBid,
        auctionEnd: product.auctionEnd.toISOString(),
        status: product.status,
        location: product.location,
        ownerId: product.sellerId,
      },
      { status: 200 }
    );
  } catch (e) {
    console.error("GET PRODUCT ERROR:", e);
    return NextResponse.json({ message: "Failed" }, { status: 500 });
  }
}

/* ----------------------------------------------------------
   PUT /api/products/[id]
-----------------------------------------------------------*/

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    /* ----------  AUTH ---------- */
    const token = getTokenFromCookieHeader(req);
    if (!token) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const decoded = verifyToken(token) as JwtPayload | null;
    const userId = getUserId(decoded);
    if (!userId) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    /* ----------  PRODUCT EXISTS? ---------- */
    const existing = await prisma.product.findUnique({
      where: { id: params.id },
      select: { sellerId: true },
    });

    if (!existing)
      return NextResponse.json({ message: "Not found" }, { status: 404 });

    /* ----------  OWNERSHIP ---------- */
    if (existing.sellerId !== userId)
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });

    /* ----------  READ BODY ---------- */
    const body = await req.json();
    const {
      title,
      description,
      images,
      price,
      endsAt,
      status,
      location,
    } = body;

    // Validate required
    if (!title || !description) {
      return NextResponse.json(
        { message: "Title & description are required" },
        { status: 400 }
      );
    }

    /* ----------  MAP TO SCHEMA ---------- */
    const updateData: any = {
      title,
      description,
      images: Array.isArray(images) ? images : [],
      location: location ?? null,
    };

    if (typeof price === "number") updateData.startingBid = price;
    if (endsAt) {
      const end = new Date(endsAt);
      if (isNaN(end.getTime()))
        return NextResponse.json({ message: "Invalid date" }, { status: 400 });
      updateData.auctionEnd = end;
    }

    // Only update status if valid enum
    if (status && ["ACTIVE", "ENDED", "CANCELLED"].includes(status)) {
      updateData.status = status;
    }

    /* ----------  UPDATE ---------- */
    const updated = await prisma.product.update({
      where: { id: params.id },
      data: updateData,
    });

    return NextResponse.json(
      {
        id: updated.id,
        title: updated.title,
        description: updated.description,
        images: updated.images,
        startingBid: updated.startingBid,
        currentBid: updated.currentBid,
        auctionEnd: updated.auctionEnd.toISOString(),
        status: updated.status,
        location: updated.location,
        ownerId: updated.sellerId,
      },
      { status: 200 }
    );
  } catch (e) {
    console.error("PUT PRODUCT ERROR:", e);
    return NextResponse.json({ message: "Failed to update product" }, { status: 500 });
  }
}
