// ========================================
// SERVER COMPONENT
// ========================================
// src/app/products/page.tsx

import { cookies } from "next/headers";
import { verifyToken } from "@/lib/jwt";
import ProductsList from "./ProductList";

export const metadata = {
  title: "Browse Products",
};

export default async function ProductsPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  const isUnauthorized = !token || !verifyToken(token);

  return <ProductsList unauthorized={isUnauthorized} />;
}
