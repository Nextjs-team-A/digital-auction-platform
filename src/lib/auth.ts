// auth.ts
// TODO: Implement authentication helpers (auth middleware, guard, etc.)
// lib/auth.ts
// Authentication helper for protected API routes

import { NextRequest } from "next/server";
import { verifyToken } from "@/lib/jwt";
import { JwtPayload } from "@/lib/jwt";

/**
 * Extract and verify the logged-in user from the request cookies.
 * Returns: JwtPayload | null
 */
export function getAuthUser(request: NextRequest): JwtPayload | null {
  const token = request.cookies.get("token")?.value;
  if (!token) return null;

  const decoded = verifyToken(token);
  if (!decoded) return null;

  return decoded as JwtPayload;
}
