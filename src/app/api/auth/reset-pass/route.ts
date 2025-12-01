// implement reset password
import type { NextApiRequest, NextApiResponse } from "next";
import bcrypt from "bcryptjs";

import { prisma } from "@/lib/db";
import { ResetPasswordDTO } from "@/utils/dto";
import { ResetPasswordSchema } from "@/utils/validationSchema";

import { verifyToken, JwtPayload } from "@/lib/jwt";
import { sendEmail, EmailTemplates } from "@/lib/mail";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    try {
        // 1. Validate incoming body using Zod
        const parseResult = ResetPasswordSchema.safeParse(req.body);

        if (!parseResult.success) {
            return res.status(400).json({
                error: "Invalid input data",
                details: parseResult.error.format(),
            });
        }

        const { token, newPassword } = parseResult.data as ResetPasswordDTO;

        // 2. Validate the token (JWT)
        const decoded = verifyToken(token);

        if (!decoded || typeof decoded === "string") {
            return res.status(400).json({
                error: "Invalid or expired reset token",
            });
        }

        const { userId, email } = decoded as JwtPayload;

        // 3. Check if user exists in DB
        const user = await prisma.user.findUnique({
            where: { id: userId },
        });

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        // 4. Hash the new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // 5. Update user password in DB
        await prisma.user.update({
            where: { id: userId },
            data: {
                passwordHash: hashedPassword,
            },
        });

        // 6. Send confirmation email
        await sendEmail(EmailTemplates.passwordChanged(email));

        // 7. Return success response
        return res.status(200).json({
            success: true,
            message: "Password has been reset successfully.",
        });

    } catch (error) {
        console.error("Reset password error:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
}
