//implement register API
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { RegisterSchema } from "@/utils/validationSchema";
import { hashPassword } from "@/lib/password-Hash";
import { createToken } from "@/lib/jwt";
import { RegisterDTO } from "@/utils/dto";

/**
 * POST /api/auth/register
 * -----------------------
 * Registers a new user.
 * - Validates email & password using Zod
 * - Checks if email already exists
 * - Hashes the password
 * - Creates user in DB
 * - Generates JWT token
 * - Stores JWT in HttpOnly cookie
 */

export async function POST(req: Request) {
  try {
    // 1. Read request body
    const body: RegisterDTO = await req.json();

    // 2. Validate input using Zod
    const parsed = RegisterSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { errors: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { email, password, role } = parsed.data;

    // 3. Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { message: "Email already registered" },
        { status: 409 }
      );
    }

    // 4. Hash password
    const passwordHash = await hashPassword(password);

    // 5. Create the user
    const newUser = await prisma.user.create({
      data: {
        email,
        passwordHash,
        role: role ?? "USER", // fallback to USER
      },
    });

    // 6. Create a JWT token for the new user
    const token = createToken({
      userId: newUser.id,
      email: newUser.email,
      role: newUser.role,
    });

    // 7. Set JWT in HttpOnly cookie
    const response = NextResponse.json(
      {
        message: "User registered successfully",
        user: {
          id: newUser.id,
          email: newUser.email,
          role: newUser.role,
        },
      },
      { status: 201 }
    );

    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24, // 1 day
    });

    return response;
  } catch (error) {
    console.error("REGISTER ERROR:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
