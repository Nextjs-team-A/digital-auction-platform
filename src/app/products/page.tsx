// ========================================
// SERVER COMPONENT
// ========================================
// src/app/products/page.tsx

import { Suspense } from "react";
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

  return (
    <Suspense fallback={<div>Loading products...</div>}>
      <ProductsList unauthorized={isUnauthorized} />
    </Suspense>
  );
}
