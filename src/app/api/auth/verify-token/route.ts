import { NextRequest, NextResponse } from "next/server";
import { verifyToken, JwtPayload } from "@/lib/jwt";
import prisma from "@/lib/db";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const token = searchParams.get("token");

  if (!token) {
    return NextResponse.json({ error: "Token is missing" }, { status: 400 });
  }

  // 1. Verify JWT signature & expiration
  const decoded = verifyToken(token);

  if (!decoded || typeof decoded === "string") {
    return NextResponse.json(
      { error: "Invalid or expired token" },
      { status: 401 }
    );
  }

  // Cast decoded to JwtPayload
  const payload = decoded as JwtPayload;

  // 2. (Optional) Check if user still exists
  // This prevents resetting passwords for deleted accounts
  try {
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, email: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(
      {
        valid: true,
        message: "Token is valid",
        user: { email: user.email },
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
