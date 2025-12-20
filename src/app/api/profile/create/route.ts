import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAuthUser } from "@/lib/auth";
import { CreateProfileSchema } from "@/utils/validationSchema";
import { ProfileDTO } from "@/utils/dto";
import { sendEmail, EmailTemplates } from "@/lib/mail";

/**
 * POST /api/profile/create
 * Requires authentication (JWT cookie)
 */
export async function POST(request: NextRequest) {
  try {
    // 1. Check authentication
    const authUser = getAuthUser(request);
    if (!authUser) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const userId = authUser.userId;

    // 2. Parse and validate request body
    const body = (await request.json()) as ProfileDTO;
    const parsed = CreateProfileSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { message: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const { firstName, lastName, phone, location } = parsed.data;

    // Normalize phone number (prevents format bypass)
    const normalizedPhone = phone ? phone.replace(/\D/g, "") : null;

    // 3. Prevent duplicate profile creation per user
    const existingProfile = await prisma.profile.findUnique({
      where: { userId },
    });

    if (existingProfile) {
      return NextResponse.json(
        { message: "Profile already exists for this user" },
        { status: 409 }
      );
    }

    // 4. Prevent duplicate phone numbers across users
    if (normalizedPhone) {
      const existingPhone = await prisma.profile.findFirst({
        where: { phone: normalizedPhone },
      });

      if (existingPhone) {
        return NextResponse.json(
          { message: "Phone number already in use" },
          { status: 409 }
        );
      }
    }

    // 5. Create profile
    const profile = await prisma.profile.create({
      data: {
        userId,
        firstName: firstName ?? null,
        lastName: lastName ?? null,
        phone: normalizedPhone,
        location: location ?? null,
      },
    });

    // 6. Fetch user email for sending welcome message
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true },
    });

    if (user) {
      // Send welcome email (non-blocking)
      sendEmail(
        EmailTemplates.profileCompleted(user.email, firstName ?? null)
      ).catch((err) =>
        console.error("Failed to send welcome email:", err)
      );
    }

    // 7. Return success response
    return NextResponse.json(
      {
        message: "Profile created successfully",
        profile,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Create profile error:", error);

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
