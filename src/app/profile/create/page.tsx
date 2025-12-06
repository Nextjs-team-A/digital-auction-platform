// src/app/profile/create/page.tsx

import ProfileCreateClient from "./ProfileCreateClient";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/jwt";

export default async function Page() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token || !verifyToken(token)) {
    return (
      <div>
        <h1>Unauthorized</h1>
        <p>You must be registered to create an account.</p>
      </div>
    );
  }

  return <ProfileCreateClient />;
}
