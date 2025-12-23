// src/app/api/auth/change-email/route.ts

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAuthUser } from "@/lib/auth";
import { z } from "zod";
import { sendEmail, EmailTemplates } from "@/lib/mail";

// DTO + Validation Schema (inline for simplicity)
const ChangeEmailSchema = z.object({
  currentEmail: z.string().email(),
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

    const { currentEmail, newEmail } = parsed.data;

    // 3️⃣ Verify "Current Email" matches the logged-in user
    if (currentEmail !== authUser.email) {
      return NextResponse.json(
        { message: "Incorrect current email" },
        { status: 400 }
      );
    }

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

    // 4️⃣ Send notification to OLD email (Security Alert)
    // We do this BEFORE updating the DB, but even if it fails, we proceed (or maybe we shouldn't? For now, we proceed but log)
    try {
      await sendEmail(EmailTemplates.emailChanged(authUser.email, newEmail)); // Send to OLD email, notifying about NEW email
    } catch (err) {
      console.warn("⚠️ Failed to notify old email:", err);
      // We continue because the user requested the change
    }

    // 5️⃣ Update email in DB
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { email: newEmail },
      select: { id: true, email: true, role: true },
    });

    // 6️⃣ Send confirmation to NEW email
    let emailStatus = "sent";
    try {
      await sendEmail(EmailTemplates.emailChanged(newEmail, newEmail));
    } catch (err) {
      console.error("❌ Failed to send confirmation to new email:", err);
      emailStatus = "failed";
      // We do NOT return 500 here, because the DB update SUCCEEDED.
      // Returning 500 would confuse the user into thinking the change didn't happen.
    }

    // 7️⃣ Return updated user info
    return NextResponse.json(
      {
        message:
          emailStatus === "sent"
            ? "Email updated successfully"
            : "Email updated, but confirmation email failed to send.",
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
