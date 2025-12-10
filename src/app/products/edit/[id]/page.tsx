// src/app/products/edit/[id]/page.tsx
import EditProductForm from "./EditProductForm";
import { cookies } from "next/headers";
import { redirect, notFound } from "next/navigation";
import type { Metadata } from "next";
import { verifyToken } from "@/lib/jwt";

type ApiProduct = {
  id: string;
  title: string;
  description: string;
  images: string[];
  startingBid?: number;
  currentBid: number | null;
  auctionEnd: string;
  category: string;
  status: string;
  ownerId?: string;
};

async function fetchProductById(id: string, cookieHeader?: string): Promise<ApiProduct | null> {
  const res = await fetch(`/api/products/${id}`, {
    method: "GET",
    headers: cookieHeader ? { Cookie: cookieHeader } : undefined,
    cache: "no-store",
  });
  if (res.status === 404) return null;
  if (!res.ok) return null;
  return (await res.json()) as ApiProduct;
}

function getUserIdFromTokenPayload(decoded: any): string | null {
  return decoded?.id ?? decoded?.sub ?? decoded?.userId ?? decoded?.uid ?? null;
}

// If your Next version makes cookies() async, we can still use async metadata.
export async function generateMetadata(
  { params }: { params: { id: string } }
): Promise<Metadata> {
  const cookieStore = await cookies(); // <-- await here
  const token = cookieStore.get("token")?.value;
  const cookieHeader = token ? `token=${token}` : undefined;

  let title = "Edit Product";
  let description = "Edit an existing product.";

  try {
    const p = await fetchProductById(params.id, cookieHeader);
    if (p) {
      title = `Edit: ${p.title}`;
      description = `Update "${p.title}" — status ${p.status}, ends ${new Date(
        p.auctionEnd
      ).toLocaleString()}.`;
    }
  } catch {
    // keep generic
  }

  return { title, description };
}

export default async function Page({ params }: { params: { id: string } }) {
  const { id } = params;

  // Layer A: must have a token
  const cookieStore = await cookies(); // <-- await here
  const token = cookieStore.get("token")?.value;
  if (!token) {
    redirect("/auth/login?next=" + encodeURIComponent(`/products/edit/${id}`));
  }

  // Verify token and normalize a user id
  let authUserId: string | null = null;
  try {
    const decoded = verifyToken(token as string) as any;
    authUserId = getUserIdFromTokenPayload(decoded);
    if (!authUserId) {
      redirect("/auth/login?next=" + encodeURIComponent(`/products/edit/${id}`));
    }
  } catch {
    redirect("/auth/login?next=" + encodeURIComponent(`/products/edit/${id}`));
  }

  // Fetch product with cookie forwarded
  const cookieHeader = `token=${token}`;
  const product = await fetchProductById(id, cookieHeader);
  if (!product) {
    notFound();
  }

  // Layer B: ownership enforcement (when ownerId is available)
  if (product.ownerId && authUserId && product.ownerId !== authUserId) {
    redirect("/products/my-products?err=not-owner");
  }

  const initialData = {
    title: product.title,
    description: product.description,
    images: product.images || [],
    price: product.startingBid ?? 0,
    currentBid: product.currentBid ?? null,
    endsAt: product.auctionEnd,
    category: product.category || "",
    status: product.status || "DRAFT",
  };

  return (
    <main style={{ padding: 20 }}>
      <h1 style={{ marginBottom: 10 }}>Edit Product</h1>
      <p style={{ color: "#666", marginBottom: 20 }}>
        Update details, images, and auction settings. Current bid and end time are shown below.
      </p>
      <EditProductForm productId={product.id} initialData={initialData} />
    </main>
  );
}
