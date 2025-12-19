import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifyToken } from "@/lib/jwt";
import ContactClient from "./ContactClient";

export const metadata = {
  title: "Contact Us",
  description: "Contact the Digital Auction Platform team",
};

export default async function ContactPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  // Layer 1: Server-side protection
  if (!token || !verifyToken(token)) {
    redirect("/login");
  }

  return <ContactClient />;
}
