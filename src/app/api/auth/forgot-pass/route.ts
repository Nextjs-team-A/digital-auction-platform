// src/app/api/auth/forgetpass/route.ts

import { NextResponse } from "next/server";
import { ForgotPasswordSchema } from "../../../../utils/validationSchema";
import type { ForgotPasswordDTO } from "../../../../utils/dto";

import { createToken } from "../../../../lib/jwt";
import { sendEmail } from "../../../../lib/mail";
import prisma from "../../../../lib/db";



export async function POST(req: Request) {
  try {
    // 1. Parse body
    const body: ForgotPasswordDTO = await req.json();

    // 2. Validate input
   const parsed = ForgotPasswordSchema.safeParse(body);

if (!parsed.success) {
  return NextResponse.json(
    { error: parsed.error.issues[0].message },
    { status: 400 }
  );
}


    const { email } = parsed.data;

    // 3. Check if user exists
    const user = await prisma.user.findUnique({
      where: { email },
    });

    // Even if user doesn't exist → return success (security)
    if (!user) {
      return NextResponse.json(
        { message: "If this email exists, you will receive a reset link." },
        { status: 200 }
      );
    }

    // 4. Generate reset token (24h)
    const resetToken = createToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    // 5. Build reset URL
    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${resetToken}`;

    // 6. Send email
    await sendEmail({
      to: email,
      subject: "Reset Your Password",
      html: `
        <h2>Password Reset Request</h2>
        <p>Click the link below to reset your password:</p>
        <a href="${resetUrl}" target="_blank">Reset Password</a>
        <p>This link will expire in 24 hours.</p>
      `,
    });

    // 7. Response
    return NextResponse.json(
      { message: "Reset link sent to your email." },
      { status: 200 }
    );
  } catch (err) {
    console.error("Forgot Password Error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
