import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { ChangePasswordSchema } from "@/utils/validationSchema";
import { ChangePasswordDTO } from "@/utils/dto";
import { hashPassword, comparePassword } from "@/lib/password-Hash";
import { verifyToken } from "@/lib/jwt";

export async function POST(req: Request) {
  try {
    // Verify authentication
    const token = req.headers.get("cookie")?.split("token=")[1]?.split(";")[0];

    // Alternatively, if token is sent in Authorization header
    // const authHeader = req.headers.get("Authorization");
    // const token = authHeader?.split(" ")[1];

    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded || typeof decoded === "string") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // @ts-ignore - jwt verify returns JwtPayload | string
    const userId = decoded.userId;

    const body: ChangePasswordDTO = await req.json();

    const parsed = ChangePasswordSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { errors: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { oldPassword, newPassword } = parsed.data;

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const isPasswordValid = await comparePassword(
      oldPassword,
      user.passwordHash
    );

    if (!isPasswordValid) {
      return NextResponse.json(
        { message: "Invalid old password" },
        { status: 400 }
      );
    }

    const passwordHash = await hashPassword(newPassword);

    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash },
    });

    return NextResponse.json(
      { message: "Password changed successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("CHANGE PASS ERROR:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
