// src/app/products/edit/[id]/page.tsx

/**
 * Edit Product Page (Server Component)
 * ---------------------------------------------------------
 * Protected server-side page for editing products
 *
 * Security Layer 1: Middleware protection (defined in src/middleware.ts)
 * - Redirects unauthenticated users to login
 * - Validates JWT token existence and validity
 *
 * Security Layer 2: Server-side token verification (this file)
 * - Double-checks authentication at page level
 * - Prevents unauthorized access even if middleware is bypassed
 *
 * Metadata:
 * - Dynamic page title and description for SEO
 *
 * @param params - Dynamic route parameter containing product ID
 */

import React from "react";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/jwt";
import EditProductForm from "./EditProductForm";
import { Metadata } from "next";

/**
 * Generate dynamic metadata for the edit page
 * This improves SEO and browser tab display
 */
export const metadata: Metadata = {
  title: "Edit Product | Digital Auction Platform",
  description:
    "Edit your product listing details, images, and auction settings on the Digital Auction Platform.",
};

/**
 * Edit Product Page Component
 * ---------------------------------------------------------
 * Server-side component with 2-layer security:
 *
 * Layer 1: Middleware (automatic redirect if no token)
 * Layer 2: Server-side verification (below)
 *
 * Flow:
 * 1. Extract token from cookies
 * 2. Verify token validity
 * 3. If valid → render EditProductForm
 * 4. If invalid → show unauthorized message
 */
export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  // SECURITY LAYER 2: Server-side authentication check
  // This is the second layer of protection after middleware
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  // Check if token exists and is valid
  if (!token || !verifyToken(token)) {
    return (
      <div style={{ maxWidth: "600px", margin: "50px auto", padding: "20px" }}>
        <h1>Unauthorized</h1>
        <p>You must be logged in to edit products.</p>
        <p>
          <a
            href="/login"
            style={{ color: "#0070f3", textDecoration: "underline" }}
          >
            Go to Login
          </a>
        </p>
      </div>
    );
  }

  // Extract product ID from dynamic route params
  const { id } = await params;

  /**
   * Render the EditProductForm component
   * Pass the product ID as a prop so the form can fetch and display existing data
   *
   * Note: API-level security will verify that the logged-in user
   * is the owner of this product before allowing updates
   */
  return (
    <div>
      <EditProductForm productId={id} />
    </div>
  );
}
