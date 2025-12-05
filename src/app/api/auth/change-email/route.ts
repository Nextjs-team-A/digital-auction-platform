// src/app/api/auth/change-email/route.ts

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAuthUser } from "@/lib/auth";
import { z } from "zod";
import { sendEmail, EmailTemplates } from "@/lib/mail";

// DTO + Validation Schema (inline for simplicity)
const ChangeEmailSchema = z.object({
  newEmail: z.string().email(),
});

export async function PUT(request: NextRequest) {
  try {
    // 1️⃣ Authenticate user
    const authUser = getAuthUser(request);
    if (!authUser) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const userId = authUser.userId;

    // 2️⃣ Parse request body
    const body = await request.json();
    const parsed = ChangeEmailSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { message: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const { newEmail } = parsed.data;

    // 3️⃣ Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: newEmail },
    });

    if (existingUser) {
      return NextResponse.json(
        { message: "Email already in use" },
        { status: 409 }
      );
    }

    // 4️⃣ Update email in DB
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { email: newEmail },
      select: { id: true, email: true, role: true },
    });

    // 5️⃣ Send confirmation email
    await sendEmail(EmailTemplates.emailChanged(newEmail));

    // 6️⃣ Return updated user info
    return NextResponse.json(
      {
        message: "Email updated successfully",
        user: updatedUser,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Change email error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
