// ========================================
// CLIENT COMPONENT
// ========================================
// src/app/products/ProductsList.tsx

"use client";

import { useEffect, useState } from "react";
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

export default function ProductsList() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await fetch("/api/products");
      const data = await res.json();

      if (res.ok) {
        setProducts(data.products || []);
      } else {
        setError(data.message || "Failed to fetch products");
      }
    } catch (err) {
      setError("Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div style={{ padding: "20px" }}>Loading products...</div>;
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
        <h1>All Products</h1>
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
          Create New Product
        </Link>
      </div>

      {products.length === 0 ? (
        <div style={{ textAlign: "center", padding: "40px" }}>
          <p>No products available yet.</p>
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
            gap: "20px",
          }}
        >
          {products.map((product) => (
            <div
              key={product.id}
              style={{
                border: "1px solid #ddd",
                padding: "15px",
                borderRadius: "8px",
              }}
            >
              {product.images && product.images.length > 0 && (
                <img
                  src={product.images[0]}
                  alt={product.title}
                  onError={(e) => {
                    console.error("Image failed to load:", product.images[0]);
                    e.currentTarget.src = "/placeholder.png"; // Fallback image
                  }}
                  style={{
                    width: "100%",
                    height: "200px",
                    objectFit: "cover",
                    marginBottom: "10px",
                    borderRadius: "4px",
                    backgroundColor: "#f0f0f0",
                  }}
                />
              )}
              <h3 style={{ marginBottom: "10px" }}>{product.title}</h3>
              <p
                style={{
                  fontSize: "14px",
                  color: "#666",
                  marginBottom: "10px",
                }}
              >
                {product.description.length > 100
                  ? product.description.substring(0, 100) + "..."
                  : product.description}
              </p>
              <div style={{ marginBottom: "10px" }}>
                <p style={{ margin: "5px 0" }}>
                  <strong>Starting Bid:</strong> ${product.startingBid}
                </p>
                <p style={{ margin: "5px 0" }}>
                  <strong>Current Bid:</strong> ${product.currentBid}
                </p>
                <p style={{ margin: "5px 0" }}>
                  <strong>Location:</strong> {product.location}
                </p>
                <p style={{ margin: "5px 0" }}>
                  <strong>Status:</strong>{" "}
                  <span
                    style={{
                      color:
                        product.status === "ACTIVE"
                          ? "green"
                          : product.status === "SOLD"
                          ? "blue"
                          : "gray",
                    }}
                  >
                    {product.status}
                  </span>
                </p>
                <p style={{ margin: "5px 0", fontSize: "14px" }}>
                  <strong>Ends:</strong>{" "}
                  {new Date(product.auctionEnd).toLocaleString()}
                </p>
              </div>

              {product.images && product.images.length > 1 && (
                <p style={{ fontSize: "12px", color: "#999" }}>
                  +{product.images.length - 1} more image(s)
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
