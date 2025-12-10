// src/app/products/my-products/MyProductsUI.tsx

"use client";

import Link from "next/link";

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
}

interface Props {
  products: Product[];
  loading: boolean;
  error: string;
  deleteLoading: string | null;
  onDelete: (id: string) => void;
  onEdit: (id: string) => void; // kept for compatibility, even though we now use <Link>
}

export default function MyProductsUI({
  products,
  loading,
  error,
  deleteLoading,
  onDelete,
  onEdit,
}: Props) {
  if (loading) {
    return <div style={{ padding: "20px" }}>Loading your products...</div>;
  }

  if (error) {
    return <div style={{ padding: "20px", color: "red" }}>{error}</div>;
  }

  return (
    <div style={{ padding: "20px" }}>
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
            }}
          >
            Create Your First Product
          </Link>
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
            gap: "20px",
          }}
        >
          {products.map((p) => (
            <div
              key={p.id}
              style={{
                border: "1px solid #ddd",
                padding: "15px",
                borderRadius: "8px",
              }}
            >
              {p.images?.[0] && (
                <img
                  src={p.images[0]}
                  alt={p.title}
                  style={{
                    width: "100%",
                    height: "200px",
                    objectFit: "cover",
                    borderRadius: "6px",
                  }}
                />
              )}

              <h3>{p.title}</h3>
              <p style={{ color: "#666", fontSize: "14px" }}>
                {p.description.length > 100
                  ? p.description.slice(0, 100) + "..."
                  : p.description}
              </p>

              <p>
                <b>Start:</b> ${p.startingBid}
              </p>
              <p>
                <b>Current:</b> ${p.currentBid}
              </p>
              <p>
                <b>Location:</b> {p.location}
              </p>
              <p>
                <b>Status:</b> {p.status}
              </p>
              <p>
                <b>Ends:</b> {new Date(p.auctionEnd).toLocaleString()}
              </p>

              {p.images?.length > 1 && (
                <small style={{ color: "#888" }}>
                  +{p.images.length - 1} more images
                </small>
              )}

              <div style={{ display: "flex", gap: "10px", marginTop: "15px" }}>
                {/* EDIT now navigates to the edit page */}
                <Link
                  href={`/products/edit/${p.id}`}
                  style={{
                    flex: 1,
                    display: "inline-block",
                    textAlign: "center",
                    padding: "8px",
                    backgroundColor: "#0070f3",
                    color: "white",
                    textDecoration: "none",
                    borderRadius: "4px",
                  }}
                >
                  Edit
                </Link>

                <button
                  onClick={() => onDelete(p.id)}
                  disabled={deleteLoading === p.id}
                  style={{
                    flex: 1,
                    padding: "8px",
                    backgroundColor:
                      deleteLoading === p.id ? "#ccc" : "#dc3545",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: deleteLoading === p.id ? "not-allowed" : "pointer",
                  }}
                >
                  {deleteLoading === p.id ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
