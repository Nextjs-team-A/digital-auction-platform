
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAuthUser } from "@/lib/auth";
import { CreateProfileSchema } from "@/utils/validationSchema";
import { ProfileDTO } from "@/utils/dto";

export async function POST(request: NextRequest) {
    try {

        const authUser = getAuthUser(request);
        if (!authUser) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const userId = authUser.userId;

        const body = (await request.json()) as ProfileDTO;
        const parsed = CreateProfileSchema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json(
                { message: parsed.error.issues[0].message },
                { status: 400 }
            );
        }

        const { firstName, lastName, phone, location } = parsed.data;

        const existingProfile = await prisma.profile.findUnique({
            where: { userId },
        });

        if (existingProfile) {
            return NextResponse.json(
                { message: "Profile already exists for this user" },
                { status: 409 }
            );
        }

        const profile = await prisma.profile.create({
            data: {
                userId,
                firstName: firstName ?? null,
                lastName: lastName ?? null,
                phone: phone ?? null,
                location: location ?? null,
            },
        });

        return NextResponse.json(
            {
                message: "Profile created successfully",
                profile,
            },
            { status: 201 }
        );
    } catch (error) {
        console.error("Create profile error:", error);
        return NextResponse.json(
            { message: "Internal server error" },
            { status: 500 }
        );
    }
}
