// app/api/auth/change-password/route.ts

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAuthUser } from "@/lib/auth";
import { ChangePasswordSchema } from "@/utils/validationSchema";
import { ChangePasswordDTO } from "@/utils/dto";
import { comparePassword, hashPassword } from "@/lib/password-Hash";
import { sendEmail, EmailTemplates } from "@/lib/mail";

/**
 * POST /api/auth/change-password
 * Body: { oldPassword, newPassword }
 * Requires: logged-in user with valid JWT
 */
export async function POST(request: NextRequest) {
  try {
    // 1. Validate authentication — must have a valid JWT cookie
    const authUser = getAuthUser(request);
    if (!authUser) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const userId = authUser.userId;

    // 2. Parse and validate body
    const body = (await request.json()) as ChangePasswordDTO;
    const parsed = ChangePasswordSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { message: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const { oldPassword, newPassword } = parsed.data;

    // 3. Fetch user from DB
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        passwordHash: true,
      },
    });

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // 4. Verify old password
    const isMatch = await comparePassword(oldPassword, user.passwordHash);
    if (!isMatch) {
      return NextResponse.json(
        { message: "Incorrect current password" },
        { status: 400 }
      );
    }

    // 5. Hash the new password
    const newHashedPassword = await hashPassword(newPassword);

    // 6. Update the password in DB
    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash: newHashedPassword },
    });

    // 7. Send notification email
    try {
      await sendEmail(EmailTemplates.passwordChanged(user.email));
    } catch (err) {
      console.error("❌ Failed to send password change notification:", err);
      // We continue to return success because the password WAS changed.
    }

    // 8. Respond success
    return NextResponse.json(
      { message: "Password updated successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Change password error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
