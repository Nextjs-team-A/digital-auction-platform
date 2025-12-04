import React from "react";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/jwt";
import ChangePasswordForm from "./ChangePasswordForm";

export default async function ChangePasswordPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token || !verifyToken(token)) {
    return (
      <div>
        <h1>Unauthorized</h1>
        <p>You must be logged in to change your password.</p>
      </div>
    );
  }

  return (
    <div>
      <h1>Change Password</h1>
      <ChangePasswordForm />
    </div>
  );
}
