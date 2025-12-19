"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import {
  FiClock,
  FiMapPin,
  FiTrendingUp,
  FiCheckCircle,
  FiXCircle,
  FiDollarSign,
  FiUsers,
  FiArrowUp,
  FiPlusCircle,
  FiZap,
  FiLock,
  FiUser,
  FiMail,
} from "react-icons/fi";
import styles from "./ProductsList.module.css";
import { useAuth } from "@/hooks/useAuth";

interface Product {
  id: string;
  sellerId: string;
  title: string;
  description: string;
  images: string[];
  startingBid: number;
  currentBid: number;
  auctionEnd: string;
  location: string;
  status: string;
  winnerId?: string;
  seller?: {
    email: string;
    profile?: {
      firstName: string | null;
      lastName: string | null;
      location: string | null;
    };
  };
}

export default function ProductsList({
  unauthorized = false,
}: {
  unauthorized?: boolean;
}) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(!unauthorized); // Don't load if unauthorized
  const [error, setError] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [bidAmount, setBidAmount] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [scrollTopVisible, setScrollTopVisible] = useState(false);
  const { user } = useAuth();

  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Enhanced star animation with glow effects
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
      pulseSpeed: number;
      pulsePhase: number;
    }> = [];

    for (let i = 0; i < 200; i++) {
      stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: Math.random() * 2,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        alpha: Math.random() * 0.6 + 0.4,
        pulseSpeed: Math.random() * 0.02 + 0.01,
        pulsePhase: Math.random() * Math.PI * 2,
      });
    }

    let animationFrame = 0;

    function animate() {
      if (!ctx || !canvas) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      animationFrame++;

      stars.forEach((star) => {
        star.x += star.vx;
        star.y += star.vy;

        if (star.x < 0 || star.x > canvas.width) star.vx *= -1;
        if (star.y < 0 || star.y > canvas.height) star.vy *= -1;

        const pulse =
          Math.sin(animationFrame * star.pulseSpeed + star.pulsePhase) * 0.3 +
          0.7;
        const currentAlpha = star.alpha * pulse;

        // Glow effect
        const gradient = ctx.createRadialGradient(
          star.x,
          star.y,
          0,
          star.x,
          star.y,
          star.radius * 3
        );
        gradient.addColorStop(0, `rgba(16, 185, 129, ${currentAlpha * 0.8})`);
        gradient.addColorStop(0.5, `rgba(16, 185, 129, ${currentAlpha * 0.3})`);
        gradient.addColorStop(1, `rgba(16, 185, 129, 0)`);

        ctx.beginPath();
        ctx.arc(star.x, star.y, star.radius * 3, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();

        // Core star
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(16, 185, 129, ${currentAlpha})`;
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

  useEffect(() => {
    const handleScroll = () => {
      setScrollTopVisible(window.scrollY > 400);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (!unauthorized) {
      fetchProducts();
    }
  }, [unauthorized]);

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

    // Strict Validation: Bid must be > startingBid AND > currentBid
    // Example: Start 100, Current 0 -> Min Bid > 100 (e.g. 101)
    // Example: Start 100, Current 120 -> Min Bid > 120 (e.g. 121)

    if (bid <= selectedProduct.startingBid) {
      alert(
        `Bid amount must be greater than the starting bid of $${selectedProduct.startingBid}.`
      );
      return;
    }

    if (bid <= selectedProduct.currentBid) {
      alert(
        `Bid amount must be higher than the current bid of $${selectedProduct.currentBid}.`
      );
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

  const getStatusBadge = (product: Product, isEnded: boolean) => {
    if (isEnded) {
      return (
        <span className={styles.badgeEnded}>
          <FiLock className={styles.badgeIcon} />
          ENDED
        </span>
      );
    }

    return (
      <span className={styles.badgeLive}>
        <FiZap className={styles.badgeIcon} />
        LIVE
      </span>
    );
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const liveProducts = products.filter((p) => !isAuctionEnded(p));
  const endedProducts = products.filter((p) => isAuctionEnded(p));

  if (unauthorized) {
    return (
      <div className={styles.page}>
        <div className={styles.bgGradient}></div>
        <canvas ref={canvasRef} className={styles.starsBg}></canvas>
        <div className={styles.content}>
          <div className={styles.unauthorizedCard}>
            <h1 className={styles.unauthorizedTitle}>Unauthorized</h1>
            <p className={styles.unauthorizedSubtitle}>
              You must be logged in to browse products.
            </p>
            <Link href="/login" className={styles.primaryButton}>
              Go to Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className={styles.page}>
        <div className={styles.bgGradient}></div>
        <canvas ref={canvasRef} className={styles.starsBg}></canvas>
        <div className={styles.content}>
          <div className={styles.loadingContainer}>
            <div className={styles.spinner}></div>
            <p>Loading auctions...</p>
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
            <FiXCircle className={styles.errorIcon} />
            <h2>Error Loading Auctions</h2>
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
      <div className={styles.bgGradient}></div>
      <canvas ref={canvasRef} className={styles.starsBg}></canvas>

      <div className={styles.content}>
        {/* Hero Section */}
        <section className={styles.hero}>
          <div className={styles.heroInner}>
            <div className={styles.badge}>
              <FiZap className={styles.badgeIconInline} />
              LIVE AUCTIONS
            </div>
            <h1 className={styles.title}>
              Discover Amazing{" "}
              <span className={styles.titleAccent}>Products</span>
            </h1>
            <p className={styles.subtitle}>
              Browse our curated selection of premium items. Place your bids and
              win incredible deals on products you love.
            </p>
          </div>
        </section>

        {/* Live Auctions Section */}
        {liveProducts.length > 0 && (
          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <div className={styles.headerTop}>
                <div className={styles.headerLeft}>
                  <h2 className={styles.sectionTitle}>
                    <FiZap className={styles.sectionTitleIcon} />
                    Live Auctions
                  </h2>
                  <p className={styles.sectionDesc}>
                    {liveProducts.length} active{" "}
                    {liveProducts.length === 1 ? "auction" : "auctions"}
                  </p>
                </div>
                <Link href="/products/create" className={styles.createBtn}>
                  <FiPlusCircle className={styles.btnIcon} />
                  Create New Auction
                </Link>
              </div>
            </div>

            <div className={styles.productsGrid}>
              {liveProducts.map((p, index) => (
                <div
                  key={p.id}
                  className={styles.productCard}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
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
                        <FiTrendingUp className={styles.placeholderIcon} />
                      </div>
                    )}
                    <div className={styles.statusBadgeWrapper}>
                      {getStatusBadge(p, false)}
                    </div>
                    <div className={styles.imageOverlay}></div>
                  </div>

                  <div className={styles.productContent}>
                    <h3 className={styles.productTitle}>{p.title}</h3>
                    <p className={styles.productDesc}>
                      {p.description.length > 100
                        ? p.description.substring(0, 100) + "..."
                        : p.description}
                    </p>

                    <div className={styles.productInfo}>
                      <div className={styles.infoItem}>
                        <span className={styles.infoLabel}>
                          <FiDollarSign className={styles.infoIcon} />
                          Starting Bid
                        </span>
                        <span className={styles.infoValue}>
                          ${p.startingBid}
                        </span>
                      </div>
                      <div className={styles.infoItem}>
                        <span className={styles.infoLabel}>
                          <FiTrendingUp className={styles.infoIcon} />
                          Current Bid
                        </span>
                        <span className={styles.infoCurrent}>
                          ${p.currentBid}
                        </span>
                      </div>
                    </div>

                    <div className={styles.productMeta}>
                      <div className={styles.metaItem}>
                        <FiMapPin className={styles.metaIcon} />
                        <span>{p.location}</span>
                      </div>
                      <div className={styles.metaItem}>
                        <FiClock className={styles.metaIcon} />
                        <span>
                          {new Date(p.auctionEnd).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    {/* Seller Info Section */}
                    {p.seller && (
                      <div className={styles.sellerSection}>
                        <div className={styles.sellerHeader}>
                          <FiUser className={styles.sellerIcon} />
                          <span className={styles.sellerName}>
                            {p.seller.profile?.firstName}{" "}
                            {p.seller.profile?.lastName}
                          </span>
                        </div>
                        <div className={styles.sellerDetails}>
                          <div className={styles.sellerDetailItem}>
                            <FiMail className={styles.sellerDetailIcon} />
                            <span>{p.seller.email}</span>
                          </div>
                          {p.seller.profile?.location && (
                            <div className={styles.sellerDetailItem}>
                              <FiMapPin className={styles.sellerDetailIcon} />
                              <span>{p.seller.profile.location}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    <button
                      onClick={() => {
                        setSelectedProduct(p);
                        setBidAmount("");
                      }}
                      className={
                        p.sellerId === user?.id
                          ? styles.sellerSelfBidBtn
                          : styles.bidBtn
                      }
                      disabled={p.sellerId === user?.id}
                    >
                      {p.sellerId === user?.id ? (
                        <>
                          <FiLock className={styles.sellerSelfBidIcon} />
                          This is Your Product
                        </>
                      ) : (
                        <>
                          <FiDollarSign className={styles.btnIcon} />
                          Place Bid
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Ended Auctions Section */}
        {endedProducts.length > 0 && (
          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <div className={styles.headerTop}>
                <div className={styles.headerLeft}>
                  <h2 className={styles.sectionTitle}>
                    <FiLock className={styles.sectionTitleIcon} />
                    Ended Auctions
                  </h2>
                  <p className={styles.sectionDesc}>
                    {endedProducts.length} completed{" "}
                    {endedProducts.length === 1 ? "auction" : "auctions"}
                  </p>
                </div>
              </div>
            </div>

            <div className={styles.productsGrid}>
              {endedProducts.map((p, index) => (
                <div
                  key={p.id}
                  className={`${styles.productCard} ${styles.productCardEnded}`}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
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
                        <FiTrendingUp className={styles.placeholderIcon} />
                      </div>
                    )}
                    <div className={styles.statusBadgeWrapper}>
                      {getStatusBadge(p, true)}
                    </div>
                    <div className={styles.imageOverlay}></div>
                    <div className={styles.endedOverlay}>
                      <FiLock className={styles.endedIcon} />
                    </div>
                  </div>

                  <div className={styles.productContent}>
                    <h3 className={styles.productTitle}>{p.title}</h3>
                    <p className={styles.productDesc}>
                      {p.description.length > 100
                        ? p.description.substring(0, 100) + "..."
                        : p.description}
                    </p>

                    <div className={styles.productInfo}>
                      <div className={styles.infoItem}>
                        <span className={styles.infoLabel}>
                          <FiDollarSign className={styles.infoIcon} />
                          Starting Bid
                        </span>
                        <span className={styles.infoValue}>
                          ${p.startingBid}
                        </span>
                      </div>
                      <div className={styles.infoItem}>
                        <span className={styles.infoLabel}>
                          <FiCheckCircle className={styles.infoIcon} />
                          Final Bid
                        </span>
                        <span className={styles.infoCurrent}>
                          ${p.currentBid}
                        </span>
                      </div>
                    </div>

                    <div className={styles.productMeta}>
                      <div className={styles.metaItem}>
                        <FiMapPin className={styles.metaIcon} />
                        <span>{p.location}</span>
                      </div>
                      <div className={styles.metaItem}>
                        <FiClock className={styles.metaIcon} />
                        <span>
                          {new Date(p.auctionEnd).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    {p.winnerId && (
                      <div className={styles.winnerBadge}>
                        <FiCheckCircle className={styles.winnerIcon} />
                        Auction Completed
                      </div>
                    )}

                    <button disabled className={styles.bidBtnDisabled}>
                      <FiLock className={styles.btnIcon} />
                      Auction Ended
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {products.length === 0 && (
          <div className={styles.emptyState}>
            <FiUsers className={styles.emptyIcon} />
            <h3>No Auctions Available</h3>
            <p>Check back later for new auctions</p>
          </div>
        )}
      </div>

      {/* Bid Modal */}
      {selectedProduct && (
        <div
          className={styles.modalOverlay}
          onClick={() => setSelectedProduct(null)}
        >
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>
                <FiDollarSign className={styles.modalTitleIcon} />
                Place Your Bid
              </h3>
              <button
                onClick={() => setSelectedProduct(null)}
                className={styles.modalClose}
              >
                <FiXCircle />
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
                <label className={styles.formLabel}>
                  <FiDollarSign className={styles.formLabelIcon} />
                  Your Bid Amount
                </label>
                <input
                  type="number"
                  placeholder={`Min: $${
                    Math.max(
                      selectedProduct.startingBid,
                      selectedProduct.currentBid
                    ) + 1
                  }`}
                  value={bidAmount}
                  onChange={(e) => setBidAmount(e.target.value)}
                  className={styles.formInput}
                  min={
                    Math.max(
                      selectedProduct.startingBid,
                      selectedProduct.currentBid
                    ) + 1
                  }
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
                      <FiCheckCircle className={styles.btnIcon} />
                      Submit Bid
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
        <FiArrowUp />
      </button>
    </div>
  );
}
