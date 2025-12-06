// src/app/profile/page.tsx
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/jwt";
import ProfileClient from "./ProfileClient";

export const metadata = {
  title: "Profile | Digital Auction Platform",
};

export default async function ProfilePage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  // Protect page: only logged-in users
  if (!token || !verifyToken(token)) {
    return (
      <div>
        <h1>Unauthorized</h1>
        <p>You must be logged in to access your profile.</p>
      </div>
    );
  }

  return <ProfileClient />;
}
