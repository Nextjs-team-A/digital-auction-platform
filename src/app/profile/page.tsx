import { cookies } from "next/headers";
import { redirect } from "next/navigation";
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
    redirect("/login");
  }

  return <ProfileClient />;
}
