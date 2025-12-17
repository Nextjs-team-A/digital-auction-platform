"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import styles from "./ProductsList.module.css";

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
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [bidAmount, setBidAmount] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [scrollTopVisible, setScrollTopVisible] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Star animation effect
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const stars: Array<{
      x: number;
      y: number;
      radius: number;
      vx: number;
      vy: number;
      alpha: number;
    }> = [];

    for (let i = 0; i < 150; i++) {
      stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: Math.random() * 1.5,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        alpha: Math.random() * 0.5 + 0.5,
      });
    }

    function animate() {
      if (!ctx || !canvas) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      stars.forEach((star) => {
        star.x += star.vx;
        star.y += star.vy;

        if (star.x < 0 || star.x > canvas.width) star.vx *= -1;
        if (star.y < 0 || star.y > canvas.height) star.vy *= -1;

        ctx.beginPath();
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(16, 185, 129, ${star.alpha})`;
        ctx.fill();
      });

      requestAnimationFrame(animate);
    }

    animate();

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Scroll to top button visibility
  useEffect(() => {
    const handleScroll = () => {
      setScrollTopVisible(window.scrollY > 400);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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
      setBidAmount("");
      fetchProducts();
    } catch (err) {
      alert("Bid failed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const isAuctionEnded = (product: Product) => {
    return (
      product.status === "ENDED" || new Date(product.auctionEnd) < new Date()
    );
  };

  const getStatusBadge = (product: Product) => {
    if (product.status === "ENDED") {
      return <span className={styles.badgeEnded}>AUCTION ENDED</span>;
    }

    if (isAuctionEnded(product)) {
      return <span className={styles.badgeEndingSoon}>ENDING SOON</span>;
    }

    return <span className={styles.badgeLive}>LIVE AUCTION</span>;
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (loading) {
    return (
      <div className={styles.page}>
        <div className={styles.bgGradient}></div>
        <canvas ref={canvasRef} className={styles.starsBg}></canvas>
        <div className={styles.content}>
          <div className={styles.loadingContainer}>
            <div className={styles.spinner}></div>
            <p>Loading products...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.page}>
        <div className={styles.bgGradient}></div>
        <canvas ref={canvasRef} className={styles.starsBg}></canvas>
        <div className={styles.content}>
          <div className={styles.errorContainer}>
            <div className={styles.errorIcon}>⚠️</div>
            <h2>Error Loading Products</h2>
            <p>{error}</p>
            <button onClick={fetchProducts} className={styles.retryBtn}>
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      {/* Layer 0: Animated gradient */}
      <div className={styles.bgGradient}></div>

      {/* Layer 1: Stars canvas */}
      <canvas ref={canvasRef} className={styles.starsBg}></canvas>

      {/* Layer 2: Content */}
      <div className={styles.content}>
        {/* Hero Section */}
        <section className={styles.hero}>
          <div className={styles.heroInner}>
            <div className={styles.badge}>🏆 LIVE AUCTIONS</div>
            <h1 className={styles.title}>
              Discover Amazing <span>Products</span>
            </h1>
            <p className={styles.subtitle}>
              Browse our curated selection of premium items. Place your bids and
              win incredible deals on products you love.
            </p>
          </div>
        </section>

        {/* Products Section */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <div className={styles.headerTop}>
              <div>
                <h2 className={styles.sectionTitle}>Available Auctions</h2>
                <p className={styles.sectionDesc}>
                  {products.length}{" "}
                  {products.length === 1 ? "product" : "products"} available
                </p>
              </div>
              <Link href="/products/create" className={styles.createBtn}>
                <span>➕</span> Create New Product
              </Link>
            </div>
          </div>

          <div className={styles.productsGrid}>
            {products.map((p) => {
              const ended = isAuctionEnded(p);

              return (
                <div
                  key={p.id}
                  className={`${styles.productCard} ${
                    ended ? styles.productCardEnded : ""
                  }`}
                >
                  {/* Image */}
                  <div className={styles.productImage}>
                    {p.images?.[0] ? (
                      <img
                        src={p.images[0]}
                        alt={p.title}
                        onError={(e) =>
                          (e.currentTarget.src = "/placeholder.png")
                        }
                      />
                    ) : (
                      <div className={styles.placeholderImage}>
                        <span>📦</span>
                      </div>
                    )}
                    <div className={styles.statusBadgeWrapper}>
                      {getStatusBadge(p)}
                    </div>
                  </div>

                  {/* Content */}
                  <div className={styles.productContent}>
                    <h3 className={styles.productTitle}>{p.title}</h3>
                    <p className={styles.productDesc}>
                      {p.description.length > 100
                        ? p.description.substring(0, 100) + "..."
                        : p.description}
                    </p>

                    <div className={styles.productInfo}>
                      <div className={styles.infoItem}>
                        <span className={styles.infoLabel}>Starting Bid</span>
                        <span className={styles.infoValue}>
                          ${p.startingBid}
                        </span>
                      </div>
                      <div className={styles.infoItem}>
                        <span className={styles.infoLabel}>Current Bid</span>
                        <span className={styles.infoCurrent}>
                          ${p.currentBid}
                        </span>
                      </div>
                    </div>

                    <div className={styles.productMeta}>
                      <div className={styles.metaItem}>
                        <span className={styles.metaIcon}>📍</span>
                        <span>{p.location}</span>
                      </div>
                      <div className={styles.metaItem}>
                        <span className={styles.metaIcon}>⏰</span>
                        <span>
                          {new Date(p.auctionEnd).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    {/* Winner Badge */}
                    {p.status === "ENDED" && p.winnerId && (
                      <div className={styles.winnerBadge}>
                        ✅ This auction has been won!
                      </div>
                    )}

                    {/* Bid Button */}
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
                      className={`${styles.bidBtn} ${
                        ended ? styles.bidBtnDisabled : ""
                      }`}
                    >
                      {ended ? "Auction Ended" : "Place Bid"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {products.length === 0 && (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>📭</div>
              <h3>No Products Available</h3>
              <p>Check back later for new auctions</p>
            </div>
          )}
        </section>
      </div>

      {/* Bid Modal */}
      {selectedProduct && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>Place Your Bid</h3>
              <button
                onClick={() => setSelectedProduct(null)}
                className={styles.modalClose}
              >
                ✕
              </button>
            </div>

            <div className={styles.modalBody}>
              <div className={styles.modalProduct}>
                <h4>{selectedProduct.title}</h4>
                <p className={styles.modalCurrentBid}>
                  Current Bid: <span>${selectedProduct.currentBid}</span>
                </p>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Your Bid Amount</label>
                <input
                  type="number"
                  placeholder={`Min: $${selectedProduct.currentBid + 1}`}
                  value={bidAmount}
                  onChange={(e) => setBidAmount(e.target.value)}
                  className={styles.formInput}
                  min={selectedProduct.currentBid + 1}
                  step="0.01"
                />
              </div>

              <div className={styles.modalActions}>
                <button
                  onClick={submitBid}
                  disabled={isSubmitting}
                  className={styles.submitBtn}
                >
                  {isSubmitting ? (
                    <>
                      <div className={styles.btnSpinner}></div>
                      Submitting...
                    </>
                  ) : (
                    <>
                      <span>💰</span> Submit Bid
                    </>
                  )}
                </button>
                <button
                  onClick={() => setSelectedProduct(null)}
                  className={styles.cancelBtn}
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Scroll to Top */}
      <button
        onClick={scrollToTop}
        className={`${styles.scrollTop} ${
          scrollTopVisible ? styles.scrollTopVisible : ""
        }`}
      >
        ↑
      </button>
    </div>
  );
}
