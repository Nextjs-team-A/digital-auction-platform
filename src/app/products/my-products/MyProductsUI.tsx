// src/app/products/my-products/MyProductsUI.tsx
// UPDATED VERSION - Add delivery management features

"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface Product {
  id: string;
  title: string;
  description: string;
  images: string[];
  startingBid: number;
  currentBid: number;
  auctionEnd: string;
  location: string;
  status: string;
  deliveryStatus?: string;
  winnerId?: string;
  finalBidAmount?: number;
  totalCollected?: number;
  sellerPayout?: number;
}

interface Props {
  products: Product[];
  loading: boolean;
  error: string;
  deleteLoading: string | null;
  onDelete: (id: string) => void;
  onEdit: (id: string) => void;
}

export default function MyProductsUI({
  products,
  loading,
  error,
  deleteLoading,
  onDelete,
  onEdit,
}: Props) {
  const router = useRouter();
  const [requestingDelivery, setRequestingDelivery] = useState<string | null>(
    null
  );

  const handleEditClick = (productId: string) => {
    router.push(`/products/edit/${productId}`);
  };

  const handleDeleteClick = (productId: string, productTitle: string) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${productTitle}"?\n\nThis action cannot be undone.`
    );

    if (confirmed) {
      onDelete(productId);
    }
  };

  /**
   * Request Delivery for a sold product
   */
  const handleRequestDelivery = async (
    productId: string,
    productTitle: string
  ) => {
    const confirmed = window.confirm(
      `Request delivery for "${productTitle}"?\n\nAhmad Delivery will be notified to pick up this item.`
    );

    if (!confirmed) return;

    try {
      setRequestingDelivery(productId);

      const res = await fetch(`/api/products/${productId}/request-delivery`, {
        method: "POST",
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to request delivery");
      }

      alert(
        "✅ Delivery requested successfully!\n\nAhmad Delivery will contact you soon."
      );

      // Refresh page to show updated status
      window.location.reload();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to request delivery");
      console.error("Request delivery error:", err);
    } finally {
      setRequestingDelivery(null);
    }
  };

  if (loading) {
    return <div style={{ padding: "20px" }}>Loading your products...</div>;
  }

  if (error) {
    return <div style={{ padding: "20px", color: "red" }}>{error}</div>;
  }

  return (
    <div style={{ padding: "20px" }}>
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px",
        }}
      >
        <h1>My Products</h1>
        <div style={{ display: "flex", gap: "10px" }}>
          <Link
            href="/products"
            style={{
              padding: "10px 20px",
              backgroundColor: "#666",
              color: "white",
              textDecoration: "none",
              borderRadius: "4px",
            }}
          >
            Browse Products
          </Link>

          <Link
            href="/products/create"
            style={{
              padding: "10px 20px",
              backgroundColor: "#0070f3",
              color: "white",
              textDecoration: "none",
              borderRadius: "4px",
            }}
          >
            Create Product
          </Link>
        </div>
      </div>

      {/* Empty State */}
      {products.length === 0 ? (
        <div style={{ textAlign: "center", padding: "40px" }}>
          <p>You have no products yet.</p>
          <Link
            href="/products/create"
            style={{
              padding: "10px 20px",
              backgroundColor: "#0070f3",
              color: "white",
              textDecoration: "none",
              borderRadius: "4px",
              display: "inline-block",
              marginTop: "10px",
            }}
          >
            Create Your First Product
          </Link>
        </div>
      ) : (
        /* Products Grid */
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
            gap: "20px",
          }}
        >
          {products.map((p) => {
            const isSold = p.status === "ENDED" && p.winnerId;
            const canRequestDelivery = isSold && p.deliveryStatus === "PENDING";

            return (
              <div
                key={p.id}
                style={{
                  border: "1px solid #ddd",
                  padding: "15px",
                  borderRadius: "8px",
                  backgroundColor: "#fff",
                }}
              >
                {/* Product Image */}
                {p.images?.[0] && (
                  <img
                    src={p.images[0]}
                    alt={p.title}
                    style={{
                      width: "100%",
                      height: "200px",
                      objectFit: "cover",
                      borderRadius: "6px",
                      marginBottom: "10px",
                    }}
                  />
                )}

                {/* Status Badge */}
                {isSold && (
                  <div
                    style={{
                      display: "inline-block",
                      padding: "4px 8px",
                      backgroundColor: "#28a745",
                      color: "white",
                      borderRadius: "4px",
                      fontSize: "12px",
                      fontWeight: "bold",
                      marginBottom: "10px",
                    }}
                  >
                    ✅ SOLD
                  </div>
                )}

                <h3 style={{ marginBottom: "10px" }}>{p.title}</h3>

                <p
                  style={{
                    color: "#666",
                    fontSize: "14px",
                    marginBottom: "10px",
                  }}
                >
                  {p.description.length > 100
                    ? p.description.slice(0, 100) + "..."
                    : p.description}
                </p>

                {/* Product Details */}
                <p style={{ marginBottom: "5px" }}>
                  <b>Starting Bid:</b> ${p.startingBid}
                </p>
                <p style={{ marginBottom: "5px" }}>
                  <b>Current Bid:</b> ${p.currentBid}
                </p>
                <p style={{ marginBottom: "5px" }}>
                  <b>Location:</b> {p.location}
                </p>
                <p style={{ marginBottom: "5px" }}>
                  <b>Status:</b> {p.status}
                </p>

                {/* Show financial info if sold */}
                {isSold && (
                  <>
                    <p style={{ marginBottom: "5px", color: "#28a745" }}>
                      <b>Final Bid:</b> ${p.finalBidAmount?.toFixed(2)}
                    </p>
                    <p style={{ marginBottom: "5px", color: "#0070f3" }}>
                      <b>Your Payout:</b> ${p.sellerPayout?.toFixed(2)}
                    </p>
                    <p style={{ marginBottom: "5px" }}>
                      <b>Delivery:</b> {p.deliveryStatus || "PENDING"}
                    </p>
                  </>
                )}

                <p style={{ marginBottom: "10px" }}>
                  <b>Ends:</b> {new Date(p.auctionEnd).toLocaleString()}
                </p>

                {p.images?.length > 1 && (
                  <small
                    style={{
                      color: "#888",
                      display: "block",
                      marginBottom: "15px",
                    }}
                  >
                    +{p.images.length - 1} more image(s)
                  </small>
                )}

                {/* Action Buttons */}
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "10px",
                  }}
                >
                  {/* Request Delivery Button (only for sold items) */}
                  {canRequestDelivery && (
                    <button
                      onClick={() => handleRequestDelivery(p.id, p.title)}
                      disabled={requestingDelivery === p.id}
                      style={{
                        padding: "8px",
                        backgroundColor:
                          requestingDelivery === p.id ? "#ccc" : "#28a745",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        cursor:
                          requestingDelivery === p.id
                            ? "not-allowed"
                            : "pointer",
                        fontSize: "14px",
                        fontWeight: "500",
                      }}
                    >
                      {requestingDelivery === p.id
                        ? "Requesting..."
                        : "🚚 Request Delivery"}
                    </button>
                  )}

                  {/* Edit/Delete Buttons (only for active auctions) */}
                  {p.status === "ACTIVE" && (
                    <div style={{ display: "flex", gap: "10px" }}>
                      <button
                        onClick={() => handleEditClick(p.id)}
                        style={{
                          flex: 1,
                          padding: "8px",
                          backgroundColor: "#0070f3",
                          color: "white",
                          border: "none",
                          borderRadius: "4px",
                          cursor: "pointer",
                          fontSize: "14px",
                          fontWeight: "500",
                        }}
                      >
                        Edit
                      </button>

                      <button
                        onClick={() => handleDeleteClick(p.id, p.title)}
                        disabled={deleteLoading === p.id}
                        style={{
                          flex: 1,
                          padding: "8px",
                          backgroundColor:
                            deleteLoading === p.id ? "#ccc" : "#dc3545",
                          color: "white",
                          border: "none",
                          borderRadius: "4px",
                          cursor:
                            deleteLoading === p.id ? "not-allowed" : "pointer",
                          fontSize: "14px",
                          fontWeight: "500",
                        }}
                      >
                        {deleteLoading === p.id ? "Deleting..." : "Delete"}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
