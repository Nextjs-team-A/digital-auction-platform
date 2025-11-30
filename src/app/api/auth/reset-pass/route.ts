import { NextResponse } from "next/server";
import { ResetPasswordSchema } from "@/utils/validationSchema";
import { ResetPasswordDTO } from "@/utils/dto";
import { hashPassword } from "@/lib/password-Hash";
import { prisma } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const body: ResetPasswordDTO = await req.json();

    const parsed = ResetPasswordSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { errors: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { token, newPassword } = parsed.data;

    // TODO: Verify token against database
    // Requires User schema update
    console.log(`[MOCK] Resetting password with token: ${token}`);

    // Mocking failure for now as we can't verify token
    return NextResponse.json(
      { message: "Password reset not fully implemented (schema missing)" },
      { status: 501 }
    );

    /*
    // Implementation when schema is ready:
    const user = await prisma.user.findFirst({
        where: {
            resetToken: token,
            resetTokenExpiry: { gt: new Date() }
        }
    });

    if (!user) {
        return NextResponse.json({ message: "Invalid or expired token" }, { status: 400 });
    }

    const passwordHash = await hashPassword(newPassword);
    await prisma.user.update({
        where: { id: user.id },
        data: {
            passwordHash,
            resetToken: null,
            resetTokenExpiry: null
        }
    });

    return NextResponse.json({ message: "Password reset successful" }, { status: 200 });
    */
  } catch (error) {
    console.error("RESET PASS ERROR:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
