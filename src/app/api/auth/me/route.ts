// src/app/api/auth/me/route.ts

/**
 * PURPOSE OF THIS ENDPOINT:
 * ---------------------------------------
 * This API returns ONLY the authenticated user's
 * core data: id, email, and role.
 *
 * It does NOT return profile details (firstName, phone…)
 * because that is handled separately by:
 *    /api/profile/me
 *
 * The `AuthContext` will call BOTH:
 *    1) GET /api/auth/me      → basic user
 *    2) GET /api/profile/me   → profile details
 */

import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";     // reads + verifies JWT from cookies
import prisma from "@/lib/db";                // DB connection

export async function GET(request: NextRequest) {
    // 1️: Extract and verify JWT token from cookies
    const authUser = getAuthUser(request);

    // If token is missing or invalid → Unauthorized
    if (!authUser) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    try {
        // 2: Fetch only essential user authentication info
        const user = await prisma.user.findUnique({
            where: { id: authUser.userId },
            select: {
                id: true,
                email: true,
                role: true, // USER or ADMIN
            },
        });

        // 3️: Extra safety check (should almost never happen)
        if (!user) {
            return NextResponse.json(
                { message: "User not found" },
                { status: 404 }
            );
        }

        // 4️: Success → return basic authenticated user
        return NextResponse.json(user, { status: 200 });

    } catch (error) {
        console.error("AUTH_ME_ERROR:", error);

        return NextResponse.json(
            { message: "Server error" },
            { status: 500 }
        );
    }
}
