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

  // Only logged-in users can create products
  if (!token || !verifyToken(token)) {
    return (
      <div style={{ padding: "50px", textAlign: "center" }}>
        <h1>Unauthorized</h1>
        <p style={{ marginTop: "20px", marginBottom: "20px" }}>
          You must be logged in to create a product.
        </p>
        <a
          href="/login"
          style={{
            padding: "10px 20px",
            backgroundColor: "#0070f3",
            color: "white",
            textDecoration: "none",
            borderRadius: "4px",
          }}
        >
          Go to Login
        </a>
      </div>
    );
  }

  return <CreateProductForm />;
}
