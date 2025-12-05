import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAuthUser } from "@/lib/auth";
import { UpdateProfileSchema } from "@/utils/validationSchema";
import type { ProfileDTO } from "@/utils/dto";
import { sendEmail, EmailTemplates } from "@/lib/mail";

/**
 * PATCH /api/profile/update
 * Authenticated user only
 * Partial updates allowed: firstName, lastName, phone, location
 */
export async function PUT(request: NextRequest) {
  try {
    // 1️⃣ Check authentication
    const authUser = getAuthUser(request);
    if (!authUser) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    const userId = authUser.userId;

    // 2️⃣ Parse request body
    const body: ProfileDTO = await request.json();

    // 3️⃣ Validate incoming data
    const parsed = UpdateProfileSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { message: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    // 4️⃣ Check if profile exists
    const existingProfile = await prisma.profile.findUnique({
      where: { userId },
    });
    if (!existingProfile) {
      return NextResponse.json(
        { message: "Profile not found" },
        { status: 404 }
      );
    }

    // 5️⃣ Apply updates (partial updates)
    const updatedProfile = await prisma.profile.update({
      where: { userId },
      data: {
        firstName: parsed.data.firstName ?? existingProfile.firstName,
        lastName: parsed.data.lastName ?? existingProfile.lastName,
        phone: parsed.data.phone ?? existingProfile.phone,
        location: parsed.data.location ?? existingProfile.location,
      },
    });

    // 6️⃣ Optional: send confirmation email if needed
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true },
    });
    if (user) {
      sendEmail(
        EmailTemplates.profileUpdated(
          user.email,
          updatedProfile.firstName ?? null
        )
      ).catch((err) =>
        console.error("Failed to send profile update email:", err)
      );
    }

    // 7️⃣ Return updated profile
    return NextResponse.json(
      { message: "Profile updated successfully", profile: updatedProfile },
      { status: 200 }
    );
  } catch (error) {
    console.error("Update profile error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
