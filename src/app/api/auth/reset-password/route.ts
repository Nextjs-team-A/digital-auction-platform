//implement reset password API

import { NextRequest, NextResponse } from "next/server";

import prisma from "@/lib/db";
import { verifyToken, JwtPayload } from "@/lib/jwt";
import { hashPassword } from "@/lib/password-Hash";

import { ResetPasswordSchema } from "@/utils/validationSchema";
import type { ResetPasswordDTO } from "@/utils/dto";

import { sendEmail, EmailTemplates } from "@/lib/mail";

export async function POST(request: NextRequest) {
  try {
    // 1) Parse and validate body with Zod (ResetPasswordSchema)
    const body = await request.json();
    const parseResult = ResetPasswordSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        {
          error: "Invalid input",
          details: parseResult.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { token, newPassword } = parseResult.data as ResetPasswordDTO;

    // 2) Validate JWT reset token
    const decoded = verifyToken(token);

    if (!decoded || typeof decoded === "string") {
      return NextResponse.json(
        { error: "Invalid or expired reset token" },
        { status: 401 }
      );
    }

    const { userId, email } = decoded as JwtPayload;

    // 3) Find user in DB
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || user.email !== email) {
      return NextResponse.json(
        { error: "User not found for this token" },
        { status: 404 }
      );
    }

    // 4) Hash new password
    const hashedPassword = await hashPassword(newPassword);

    // 5) Update user password in DB
    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash: hashedPassword,
      },
    });

    // 6) Send confirmation email using centralized mail helper
    try {
      await sendEmail(EmailTemplates.passwordChanged(user.email));
    } catch (emailError) {
      console.error(
        "❌ Failed to send password reset confirmation email:",
        emailError
      );
      // Continue execution to return success for the password update
    }

    // 7) Return success response
    return NextResponse.json(
      {
        success: true,
        message: "Password has been reset successfully.",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Reset password error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
