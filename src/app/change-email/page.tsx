// src/app/change-email/page.tsx
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/jwt";
import ChangeEmailForm from "./ChangeEmailForm";

export const metadata = {
  title: "Change Email",
};

export default async function ChangeEmailPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  // Only logged-in users
  if (!token || !verifyToken(token)) {
    return (
      <div>
        <h1>Unauthorized</h1>
        <p>You must be logged in to change your email.</p>
      </div>
    );
  }

  return (
    <div>
      <h1>Change Email</h1>
      <ChangeEmailForm />
    </div>
  );
}
