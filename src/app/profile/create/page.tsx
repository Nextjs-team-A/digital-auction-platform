// src/app/profile/create/page.tsx

import ProfileCreateClient from "./ProfileCreateClient";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/jwt";

export default async function Page() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token || !verifyToken(token)) {
    return <ProfileCreateClient unauthorized />;
  }

  return <ProfileCreateClient />;
}
