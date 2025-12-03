import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import prisma from "@/lib/db";

export async function GET(request: NextRequest) {
    // 1️⃣ Authenticate user from token
    const authUser = getAuthUser(request);
    if (!authUser) {
        return NextResponse.json(
            { message: "Unauthorized" },
            { status: 401 }
        );
    }

    try {
        // 2️⃣ Find the user's profile
        const profile = await prisma.profile.findUnique({
            where: { userId: authUser.userId },
        });

        // 3️⃣ Handle missing profile
        if (!profile) {
            return NextResponse.json(
                { message: "Profile not found" },
                { status: 404 }
            );
        }

        // 4️⃣ Return the profile
        return NextResponse.json(profile, { status: 200 });
    } catch (error) {
        console.error("PROFILE_FETCH_ERROR:", error);
        return NextResponse.json(
            { message: "Server error" },
            { status: 500 }
        );
    }
}