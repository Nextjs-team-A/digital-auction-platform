// src/app/products/page.tsx

import type { Metadata } from "next";
import Link from "next/link";
import prisma from "@/lib/db";
import ProductList, { ProductListItem } from "./ProductList";

/**
 * Metadata for SEO and browser tab
 */
export const metadata: Metadata = {
  title: "Products | Digital Auction Platform",
  description: "Browse all active auction products on the Digital Auction Platform.",
};

/**
 * SERVER COMPONENT
 * --------------------------------------------------
 * This component runs ONLY on the server.
 * It:
 *  - Fetches products from the database using Prisma
 *  - Transforms them into a serializable shape for the client
 *  - Renders layout + passes products to the client-side ProductList
 */
export default async function ProductsPage() {
  // 1️⃣ Fetch all products from DB (server-side)
  const productsFromDb = await prisma.product.findMany({

  });

  // 2️⃣ Map DB product shape → ProductListItem shape for the client component
  const products: ProductListItem[] = productsFromDb.map((p) => ({
    id: p.id,
    title: p.title,
    description: p.description,
    images: p.images,
    startingBid: p.startingBid,
    currentBid: p.currentBid,
    auctionEnd: p.auctionEnd.toISOString(), // convert Date → string for client
    location: p.location ?? "Unknown",
    status: p.status, // "ACTIVE" | "ENDED" | "CANCELLED"
  }));

  // 3️⃣ Render server layout + pass products to client-side ProductList
  return (
    <div style={{ padding: "20px" }}>
      {/* Header + Create button (server-rendered) */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px",
        }}
      >
        <h1>All Products</h1>
        <Link
          href="/products/create"
          style={{
            padding: "10px 20px",
            backgroundColor: "#0070f3",
            color: "white",
            textDecoration: "none",
          }}
        >
          Create New Product
        </Link>
      </div>

      {/* Client-side component for rendering product grid */}
      <ProductList products={products} />
    </div>
  );
}
