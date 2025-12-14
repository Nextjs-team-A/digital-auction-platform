// src/app/products/page.tsx (or wherever your ProductsList component is)

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
  winnerId?: string;
}

export default function ProductsList() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Bidding states
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [bidAmount, setBidAmount] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const submitBid = async () => {
    if (!selectedProduct) return;

    const bid = parseFloat(bidAmount);
    if (isNaN(bid) || bid <= 0) {
      alert("Please enter a valid bid amount.");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch(`/api/products/${selectedProduct.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bidAmount: bid }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message ?? "Bid failed");
        return;
      }

      alert("Bid placed successfully!");
      setSelectedProduct(null);
      fetchProducts();
    } catch (err) {
      alert("Bid failed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Check if auction has ended
   */
  const isAuctionEnded = (product: Product) => {
    return (
      product.status === "ENDED" || new Date(product.auctionEnd) < new Date()
    );
  };

  /**
   * Get auction status badge
   */
  const getStatusBadge = (product: Product) => {
    if (product.status === "ENDED") {
      return (
        <span
          style={{
            display: "inline-block",
            padding: "4px 8px",
            backgroundColor: "#dc3545",
            color: "white",
            borderRadius: "4px",
            fontSize: "12px",
            fontWeight: "bold",
            marginBottom: "10px",
          }}
        >
          AUCTION ENDED
        </span>
      );
    }

    if (isAuctionEnded(product)) {
      return (
        <span
          style={{
            display: "inline-block",
            padding: "4px 8px",
            backgroundColor: "#ffc107",
            color: "#000",
            borderRadius: "4px",
            fontSize: "12px",
            fontWeight: "bold",
            marginBottom: "10px",
          }}
        >
          ENDING SOON
        </span>
      );
    }

    return (
      <span
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
        LIVE AUCTION
      </span>
    );
  };

  if (loading) return <div style={{ padding: 20 }}>Loading...</div>;
  if (error) return <div style={{ padding: 20, color: "red" }}>{error}</div>;

  return (
    <div style={{ padding: "20px" }}>
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
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
            borderRadius: "4px",
            textDecoration: "none",
          }}
        >
          Create New Product
        </Link>
      </div>

      {/* Product list */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
          gap: "20px",
        }}
      >
        {products.map((p) => {
          const ended = isAuctionEnded(p);

          return (
            <div
              key={p.id}
              style={{
                border: "1px solid #ddd",
                borderRadius: "8px",
                padding: "15px",
                opacity: ended ? 0.7 : 1,
              }}
            >
              {p.images?.[0] && (
                <img
                  src={p.images[0]}
                  alt={p.title}
                  onError={(e) => (e.currentTarget.src = "/placeholder.png")}
                  style={{
                    width: "100%",
                    height: 200,
                    objectFit: "cover",
                    borderRadius: 4,
                    marginBottom: 10,
                  }}
                />
              )}

              {/* Status Badge */}
              {getStatusBadge(p)}

              <h3>{p.title}</h3>
              <p style={{ color: "#666" }}>
                {p.description.length > 100
                  ? p.description.substring(0, 100) + "..."
                  : p.description}
              </p>

              <p>
                <strong>Starting Bid:</strong> ${p.startingBid}
              </p>
              <p>
                <strong>Current Bid:</strong> ${p.currentBid}
              </p>
              <p>
                <strong>Location:</strong> {p.location}
              </p>
              <p>
                <strong>Ends:</strong> {new Date(p.auctionEnd).toLocaleString()}
              </p>

              {/* Bid Button - Disabled if auction ended */}
              <button
                onClick={() => {
                  if (ended) {
                    alert(
                      "This auction has ended. Bidding is no longer available."
                    );
                    return;
                  }
                  setSelectedProduct(p);
                  setBidAmount("");
                }}
                disabled={ended}
                style={{
                  marginTop: "10px",
                  width: "100%",
                  padding: "10px",
                  background: ended ? "#ccc" : "#2563eb",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  cursor: ended ? "not-allowed" : "pointer",
                }}
                title={ended ? "Auction has ended" : "Place a bid"}
              >
                {ended ? "Auction Ended" : "Make a Bid"}
              </button>

              {/* Show winner if auction ended */}
              {p.status === "ENDED" && p.winnerId && (
                <p
                  style={{
                    marginTop: "10px",
                    padding: "10px",
                    backgroundColor: "#d4edda",
                    borderRadius: "4px",
                    fontSize: "14px",
                    color: "#155724",
                  }}
                >
                  ✅ This auction has been won!
                </p>
              )}
            </div>
          );
        })}
      </div>

      {/* Modal */}
      {selectedProduct && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <div
            style={{
              background: "white",
              padding: "20px",
              width: 400,
              borderRadius: 8,
            }}
          >
            <h3>Place Bid for: {selectedProduct.title}</h3>

            <input
              type="number"
              placeholder="Enter your bid"
              value={bidAmount}
              onChange={(e) => setBidAmount(e.target.value)}
              style={{
                width: "100%",
                padding: "10px",
                borderRadius: 6,
                marginTop: 10,
                border: "1px solid #ccc",
              }}
            />

            <button
              onClick={submitBid}
              disabled={isSubmitting}
              style={{
                marginTop: 10,
                width: "100%",
                padding: 10,
                background: "green",
                color: "white",
                borderRadius: 6,
                cursor: isSubmitting ? "not-allowed" : "pointer",
              }}
            >
              {isSubmitting ? "Submitting..." : "Submit Bid"}
            </button>

            <button
              onClick={() => setSelectedProduct(null)}
              style={{
                marginTop: 10,
                width: "100%",
                padding: 10,
                background: "#888",
                color: "white",
                borderRadius: 6,
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
