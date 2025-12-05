import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyToken } from "@/lib/jwt";

// Define paths that require authentication
const protectedPaths = [
  "/profile",
  "/change-password",
  // Add more pages that require login here
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

// Apply middleware only to the paths we care about
export const config = {
  matcher: ["/profile/:path*", "/change-password/:path*"],
};
