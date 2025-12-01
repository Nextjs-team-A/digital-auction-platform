// app/api/auth/login/route.ts
import { prisma } from "@/lib/db";
import { LoginSchema } from "@/utils/validationSchema";
import { LoginDTO } from "@/utils/dto";
import { comparePassword } from "@/lib/password-Hash";
import { createToken } from "@/lib/jwt";
import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/auth/login
 * Body: { email, password }
 * Returns: httpOnly cookie "token" + basic user info
 */
export async function POST(request: NextRequest) {
  try {
    // 1. Parse request body
    const body = (await request.json()) as LoginDTO;

    // 2. Validate input using Zod
    const parsed = LoginSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { message: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const { email, password } = parsed.data;

    // 3. Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        passwordHash: true,
        role: true,
      },
    });

    // 4. If user not found
    if (!user) {
      return NextResponse.json(
        { message: "Invalid credentials" },
        { status: 401 }
      );
    }

    // 5. Compare password
    const isMatch = await comparePassword(password, user.passwordHash);
    if (!isMatch) {
      return NextResponse.json(
        { message: "Invalid credentials" },
        { status: 401 }
      );
    }

    // 6. Create JWT token
    const token = createToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    // 7. Prepare safe response (omit passwordHash)
    const response = NextResponse.json(
      {
        message: "Login successful",
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
        },
      },
      { status: 200 }
    );

    // 8. Set HttpOnly cookie for session
    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24, // 1 day
      path: "/",
    });

    return response;
  } catch (err) {
    console.error("Login error:", err);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
