// src/app/products/create/page.tsx

import { cookies } from "next/headers";
import { verifyToken } from "@/lib/jwt";
import CreateProductForm from "./CreateProductForm";

export const metadata = {
  title: "Create Product",
};

export default async function CreateProductPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token || !verifyToken(token)) {
    return <CreateProductForm unauthorized />;
  }

  return <CreateProductForm />;
}
