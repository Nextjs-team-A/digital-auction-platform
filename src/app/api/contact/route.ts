import { NextRequest, NextResponse } from "next/server";
import { ContactSchema } from "@/utils/validationSchema";
import { sendEmail } from "@/lib/mail";
import { getAuthUser } from "@/lib/auth";

export function POST(req: NextRequest) {
  try {
    // 1️⃣ Authenticate user
    const user = getAuthUser(req);
    if (!user) {
      return NextResponse.json(
        { message: "Unauthorized you must be logged in" },
        { status: 401 }
      );
    }

    // 2️⃣ Parse and validate body
    return req.json().then(async (body) => {
      const parsed = ContactSchema.safeParse(body);

      if (!parsed.success) {
        return NextResponse.json(
          { errors: parsed.error.flatten().fieldErrors },
          { status: 400 }
        );
      }

      const { subject, message } = parsed.data;

      // 3️⃣ Send email to platform inbox
      await sendEmail({
        to: process.env.EMAIL_USER!,
        subject: `[Contact] ${subject}`,
        html: `
          <h2>New Contact Message</h2>
          <p><strong>From:</strong> ${user.email}</p>
          <p><strong>Role:</strong> ${user.role}</p>
          <hr />
          <p>${message.replace(/\n/g, "<br />")}</p>
        `,
        text: `
From: ${user.email}
Role: ${user.role}

${message}
        `,
      });

      return NextResponse.json(
        { message: "Message sent successfully" },
        { status: 200 }
      );
    });
  } catch (error) {
    console.error("CONTACT ERROR:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
