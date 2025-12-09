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

  // NEW STATES FOR BIDDING
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

  // SUBMIT BID FUNCTION
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
        body: JSON.stringify({
          bidAmount: bid,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Bid failed");
        return;
      }

      alert("Bid placed successfully!");
      setSelectedProduct(null);

      // Refresh product list to show updated currentBid
      fetchProducts();
    } catch (err) {
      alert("Bid failed. Try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <div style={{ padding: "20px" }}>Loading products...</div>;
  }

  if (error) {
    return <div style={{ padding: "20px", color: "red" }}>{error}</div>;
  }

  return (
    <>
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
                {product.images?.[0] && (
                  <img
                    src={product.images[0]}
                    alt={product.title}
                    onError={(e) => {
                      e.currentTarget.src = "/placeholder.png";
                    }}
                    style={{
                      width: "100%",
                      height: "200px",
                      objectFit: "cover",
                      borderRadius: "4px",
                    }}
                  />
                )}

                <h3>{product.title}</h3>

                <p style={{ fontSize: "14px", color: "#666" }}>
                  {product.description.length > 100
                    ? product.description.substring(0, 100) + "..."
                    : product.description}
                </p>

                <p>
                  <strong>Starting Bid:</strong> ${product.startingBid}
                </p>
                <p>
                  <strong>Current Bid:</strong> ${product.currentBid}
                </p>
                <p>
                  <strong>Ends:</strong>{" "}
                  {new Date(product.auctionEnd).toLocaleString()}
                </p>

                <button
                  style={{
                    marginTop: "10px",
                    width: "100%",
                    padding: "10px",
                    background: "#2563eb",
                    color: "white",
                    border: "none",
                    borderRadius: "6px",
                    cursor: "pointer",
                  }}
                  onClick={() => {
                    setSelectedProduct(product);
                    setBidAmount("");
                  }}
                >
                  Make a Bid
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* BID MODAL */}
      {selectedProduct && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 50,
          }}
        >
          <div
            style={{
              background: "white",
              padding: "20px",
              width: "400px",
              borderRadius: "8px",
            }}
          >
            <h3>Place Bid for: {selectedProduct.title}</h3>

            <input
              type="number"
              value={bidAmount}
              onChange={(e) => setBidAmount(e.target.value)}
              placeholder="Enter your bid"
              style={{
                width: "100%",
                padding: "10px",
                marginTop: "10px",
                borderRadius: "6px",
              }}
            />

            <button
              onClick={submitBid}
              disabled={isSubmitting}
              style={{
                marginTop: "10px",
                width: "100%",
                padding: "10px",
                background: "green",
                color: "white",
                border: "none",
                borderRadius: "6px",
              }}
            >
              {isSubmitting ? "Submitting..." : "Submit Bid"}
            </button>

            <button
              onClick={() => setSelectedProduct(null)}
              style={{
                marginTop: "10px",
                width: "100%",
                padding: "10px",
                background: "#888",
                color: "white",
                border: "none",
                borderRadius: "6px",
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </>
  );
}
