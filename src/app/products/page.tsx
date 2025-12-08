// src/app/products/page.tsx

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

export default function ProductsPage() {
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
          }}
        >
          Create New Product
        </Link>
      </div>

      {products.length === 0 ? (
        <p>No products available yet.</p>
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
              style={{ border: "1px solid #ddd", padding: "15px" }}
            >
              {product.images && product.images.length > 0 && (
                <img
                  src={product.images[0]}
                  alt={product.title}
                  style={{
                    width: "100%",
                    height: "200px",
                    objectFit: "cover",
                    marginBottom: "10px",
                  }}
                />
              )}
              <h3>{product.title}</h3>
              <p style={{ fontSize: "14px", color: "#666" }}>
                {product.description}
              </p>
              <p>
                <strong>Starting Bid:</strong> ${product.startingBid}
              </p>
              <p>
                <strong>Current Bid:</strong> ${product.currentBid}
              </p>
              <p>
                <strong>Location:</strong> {product.location}
              </p>
              <p>
                <strong>Status:</strong> {product.status}
              </p>
              <p>
                <strong>Ends:</strong>{" "}
                {new Date(product.auctionEnd).toLocaleString()}
              </p>

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
