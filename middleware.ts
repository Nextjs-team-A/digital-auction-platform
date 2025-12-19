// src/middleware.ts

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyToken } from "@/lib/jwt";

// Define paths that require authentication
const protectedPaths = [
  "/profile",
  "/change-password",
  "/change-email",
  "/products/create",
  "/products/my-products",
  "/products/edit",
  "/contact",
];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Only run middleware for protected paths
  if (protectedPaths.some((path) => pathname.startsWith(path))) {
    const token = req.cookies.get("token")?.value;

    // If no token → redirect to login
    if (!token) {
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("error", "You must be logged in");
      return NextResponse.redirect(loginUrl);
    }

    // Verify token
    const decoded = verifyToken(token);
    if (!decoded) {
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("error", "Invalid or expired session");
      return NextResponse.redirect(loginUrl);
    }
  }

  // Allow the request if authenticated or not a protected path
  return NextResponse.next();
}

// Apply middleware to protected paths
export const config = {
  matcher: [
    "/profile/:path*",
    "/change-password/:path*",
    "/change-email/:path*",
    "/products/create/:path*",
    "/products/my-products/:path*",
    "/products/edit/:path*",
    "/contact/:path*",
  ],
};
