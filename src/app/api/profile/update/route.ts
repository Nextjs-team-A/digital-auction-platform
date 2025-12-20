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
 * 
 * CHANGES ADDED:
 * 1️⃣ Phone normalization to digits only
 * 2️⃣ Phone uniqueness check across other users
 * 3️⃣ Prisma P2002 error handling for race conditions
 * 4️⃣ Debug logging (optional)
 */
export async function PATCH(request: NextRequest) {
  try {
    // 1️⃣ Check authentication
    const authUser = getAuthUser(request);
    // Optional debug to check logged in user
    console.log("authUser (update):", authUser);

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
    const existingProfile = await prisma.profile.findFirst({
      where: { userId },
    });
    if (!existingProfile) {
      return NextResponse.json(
        { message: "Profile not found" },
        { status: 404 }
      );
    }

    // 5️⃣ Normalize phone number (prevents format bypass)
    const normalizedPhone = parsed.data.phone
      ? parsed.data.phone.replace(/\D/g, "")
      : existingProfile.phone;

    // 6️⃣ Prevent duplicate phone numbers across other users
    if (normalizedPhone) {
      const existingPhone = await prisma.profile.findFirst({
        where: {
          phone: normalizedPhone,
          NOT: { userId }, // ignore current user's own profile
        },
      });

      if (existingPhone) {
        return NextResponse.json(
          { message: "Phone number already in use" },
          { status: 409 }
        );
      }
    }

    // 7️⃣ Apply updates (partial updates)
    const updatedProfile = await prisma.profile.update({
      where: { userId },
      data: {
        firstName: parsed.data.firstName ?? existingProfile.firstName,
        lastName: parsed.data.lastName ?? existingProfile.lastName,
        phone: normalizedPhone, // use normalized phone
        location: parsed.data.location ?? existingProfile.location,
      },
    });

    // 8️⃣ Optional: send confirmation email
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

    // 9️⃣ Return updated profile
    return NextResponse.json(
      { message: "Profile updated successfully", profile: updatedProfile },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Update profile error:", error);

    // 🔒 DB-level uniqueness safety (race conditions)
    if (error.code === "P2002") {
      return NextResponse.json(
        { message: "Phone number already in use" },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
