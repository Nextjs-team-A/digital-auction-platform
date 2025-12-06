// src/app/api/profile/me/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import prisma from "@/lib/db";

// ===================== GET PROFILE =====================
export async function GET(request: NextRequest) {
  // 1️⃣ Authenticate user
  const authUser = getAuthUser(request);
  if (!authUser) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    // 2️⃣ Fetch user + profile in one query
    const user = await prisma.user.findUnique({
      where: { id: authUser.userId },
      select: {
        id: true,
        email: true,
        role: true,
        profile: true, // includes firstName, lastName, phone, location...
      },
    });

    // 3️⃣ Handle missing user
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // 4️⃣ Handle missing profile
    if (!user.profile) {
      return NextResponse.json(
        { message: "Profile not found" },
        { status: 404 }
      );
    }

    // 5️⃣ Success — return user + profile
    return NextResponse.json(user, { status: 200 });
  } catch (error) {
    console.error("PROFILE_FETCH_ERROR:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

// ===================== UPDATE PROFILE =====================
export async function PUT(request: NextRequest) {
  // 1️⃣ Authenticate user
  const authUser = getAuthUser(request);
  if (!authUser) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    // 2️⃣ Get data from request body
    const body = await request.json();
    const { firstName, lastName, phone, location } = body;

    // 3️⃣ Update profile in database
    const updatedProfile = await prisma.profile.update({
      where: { userId: authUser.userId },
      data: {
        firstName,
        lastName,
        phone,
        location,
      },
    });

    // 4️⃣ Return updated profile
    return NextResponse.json({ message: "Profile updated", profile: updatedProfile });
  } catch (error) {
    console.error("PROFILE_UPDATE_ERROR:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
