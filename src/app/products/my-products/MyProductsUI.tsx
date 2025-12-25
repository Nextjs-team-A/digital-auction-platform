"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import {
  FiEdit3,
  FiTrash2,
  FiTruck,
  FiDollarSign,
  FiMapPin,
  FiClock,
  FiCheckCircle,
  FiPackage,
  FiPlusCircle,
  FiGrid,
  FiAlertCircle,
  FiZap,
  FiLock,
  FiTrendingUp,
} from "react-icons/fi";
import styles from "./MyProductsUI.module.css";
import SearchBar from "@/components/SearchBar";
import { useTheme } from "next-themes";

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
  unauthorized?: boolean;
}

export default function MyProductsUI({ unauthorized = false }: Props) {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(!unauthorized);
  const [error, setError] = useState("");
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);
  const [requestingDelivery, setRequestingDelivery] = useState<string | null>(
    null
  );

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { resolvedTheme } = useTheme();
  const isDarkRef = useRef(false);

  useEffect(() => {
    isDarkRef.current = resolvedTheme === "dark";
  }, [resolvedTheme]);

  useEffect(() => {
    if (!unauthorized) {
      fetchMyProducts();
    }
  }, [unauthorized]);

  const fetchMyProducts = async () => {
    try {
      const res = await fetch("/api/products?my=true", {
        method: "GET",
        credentials: "include",
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to fetch products");
      }

      setProducts(data.products || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (productId: string) => {
    setDeleteLoading(productId);
    setError("");

    try {
      const res = await fetch(`/api/products/${productId}`, {
        method: "DELETE",
        credentials: "include",
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Delete failed");
      }

      setProducts((prev) => prev.filter((p) => p.id !== productId));
      alert("Product deleted successfully!");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Delete failed");
    } finally {
      setDeleteLoading(null);
    }
  };

  // Enhanced star animation (theme-aware)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Use DPR for crisper canvas
    const DPR = Math.min(window.devicePixelRatio || 1, 2);

    const resize = () => {
      canvas.width = Math.floor(window.innerWidth * DPR);
      canvas.height = Math.floor(window.innerHeight * DPR);
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    };

    resize();

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

    const buildStars = () => {
      stars.length = 0;
      const count = Math.max(
        120,
        Math.floor((window.innerWidth * window.innerHeight) / 14000)
      );
      for (let i = 0; i < count; i++) {
        stars.push({
          x: Math.random() * window.innerWidth,
          y: Math.random() * window.innerHeight,
          radius: Math.random() * 2,
          vx: (Math.random() - 0.5) * 0.4,
          vy: (Math.random() - 0.5) * 0.4,
          alpha: Math.random() * 0.6 + 0.4,
          pulseSpeed: Math.random() * 0.02 + 0.01,
          pulsePhase: Math.random() * Math.PI * 2,
        });
      }
    };

    buildStars();

    let animationFrame = 0;
    let rafId = 0;

    function animate() {
      if (!ctx || !canvas) return;
      animationFrame++;

      // theme-aware background overlay/trail
      if (isDarkRef.current) {
        ctx.fillStyle = "rgba(7, 8, 10, 0.12)";
        ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);
      } else {
        ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      }

      for (const star of stars) {
        star.x += star.vx;
        star.y += star.vy;

        if (star.x < 0 || star.x > window.innerWidth) star.vx *= -1;
        if (star.y < 0 || star.y > window.innerHeight) star.vy *= -1;

        const pulse =
          Math.sin(animationFrame * star.pulseSpeed + star.pulsePhase) * 0.3 +
          0.7;
        const currentAlpha = star.alpha * pulse;

        // Glow effect (green halo)
        const gradient = ctx.createRadialGradient(
          star.x,
          star.y,
          0,
          star.x,
          star.y,
          star.radius * 3
        );
        gradient.addColorStop(
          0,
          `rgba(16, 185, 129, ${currentAlpha * (isDarkRef.current ? 0.9 : 0.8)
          })`
        );
        gradient.addColorStop(
          0.5,
          `rgba(16, 185, 129, ${currentAlpha * (isDarkRef.current ? 0.35 : 0.3)
          })`
        );
        gradient.addColorStop(1, `rgba(16, 185, 129, 0)`);

        ctx.beginPath();
        ctx.arc(star.x, star.y, star.radius * 3, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();

        // Core star color: whiteish in dark mode, green in light
        const coreColor = isDarkRef.current
          ? `rgba(246,247,249,${Math.min(1, currentAlpha + 0.08)})`
          : `rgba(16, 185, 129, ${currentAlpha})`;

        ctx.beginPath();
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        ctx.fillStyle = coreColor;
        ctx.fill();
      }

      rafId = requestAnimationFrame(animate);
    }

    animate();

    const handleResize = () => {
      resize();
      buildStars();
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
      if (rafId) cancelAnimationFrame(rafId);
    };
    // re-run if theme changes so isDarkRef is respected in animation loop
  }, [resolvedTheme]);

  const handleEditClick = (productId: string) => {
    router.push(`/products/edit/${productId}`);
  };
  const handleDeleteClick = (productId: string, productTitle: string) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${productTitle}"?\n\nThis action cannot be undone.`
    );

    if (confirmed) {
      handleDelete(productId);
    }
  };

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
      window.location.reload();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to request delivery");
      console.error("Request delivery error:", err);
    } finally {
      setRequestingDelivery(null);
    }
  };

  if (unauthorized) {
    return (
      <div className={styles.page}>
        <div className={styles.bgGradient}></div>
        <canvas ref={canvasRef} className={styles.starsBg}></canvas>
        <div className={styles.content}>
          <div className={styles.unauthorizedCard}>
            <h1 className={styles.unauthorizedTitle}>Unauthorized</h1>
            <p className={styles.unauthorizedSubtitle}>
              You must be logged in to view your products.
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
            <p>Loading your products...</p>
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
            <FiAlertCircle className={styles.errorIcon} />
            <h2>Error Loading Products</h2>
            <p>{error}</p>
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
              <FiPackage className={styles.badgeIcon} />
              MY AUCTIONS
            </div>
            <h1 className={styles.title}>
              Your <span className={styles.titleAccent}>Products</span>
            </h1>
            <p className={styles.subtitle}>
              Manage your auction listings, track sales, and handle deliveries
              all in one place.
            </p>
            <SearchBar />
          </div>
        </section>

        {/* Actions Bar */}
        <section className={styles.actionsBar}>
          <div className={styles.actionsInner}>
            <div className={styles.statsGroup}>
              <div className={styles.statItem}>
                <FiGrid className={styles.statIcon} />
                <div className={styles.statContent}>
                  <span className={styles.statValue}>{products.length}</span>
                  <span className={styles.statLabel}>Total Products</span>
                </div>
              </div>
              <div className={styles.statItem}>
                <FiZap className={styles.statIcon} />
                <div className={styles.statContent}>
                  <span className={styles.statValue}>
                    {products.filter((p) => p.status === "ACTIVE").length}
                  </span>
                  <span className={styles.statLabel}>Active</span>
                </div>
              </div>
              <div className={styles.statItem}>
                <FiCheckCircle className={styles.statIcon} />
                <div className={styles.statContent}>
                  <span className={styles.statValue}>
                    {
                      products.filter((p) => p.status === "ENDED" && p.winnerId)
                        .length
                    }
                  </span>
                  <span className={styles.statLabel}>Sold</span>
                </div>
              </div>
            </div>

            <div className={styles.actionButtons}>
              <Link href="/products" className={styles.secondaryBtn}>
                <FiGrid className={styles.btnIcon} />
                Browse All
              </Link>
              <Link href="/products/create" className={styles.primaryBtn}>
                <FiPlusCircle className={styles.btnIcon} />
                Create Product
              </Link>
            </div>
          </div>
        </section>

        {/* Products Section */}
        <section className={styles.section}>
          {products.length === 0 ? (
            <div className={styles.emptyState}>
              <FiPackage className={styles.emptyIcon} />
              <h3>No Products Yet</h3>
              <p>Start creating your first auction listing to get started.</p>
              <Link href="/products/create" className={styles.createBtn}>
                <FiPlusCircle className={styles.btnIcon} />
                Create Your First Product
              </Link>
            </div>
          ) : (
            <div className={styles.productsGrid}>
              {products.map((p, index) => {
                const isSold = p.status === "ENDED" && p.winnerId;
                const isActive = p.status === "ACTIVE";
                const canRequestDelivery =
                  isSold && p.deliveryStatus === "PENDING";

                return (
                  <div
                    key={p.id}
                    className={`${styles.productCard} ${!isActive ? styles.productCardEnded : ""
                      }`}
                    style={{ animationDelay: `${index * 0.1}s` }}
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
                          <FiPackage className={styles.placeholderIcon} />
                        </div>
                      )}

                      {/* Status Badge */}
                      <div className={styles.statusBadgeWrapper}>
                        {isSold ? (
                          <span className={styles.badgeSold}>
                            <FiCheckCircle className={styles.badgeIconSmall} />
                            SOLD
                          </span>
                        ) : isActive ? (
                          <span className={styles.badgeLive}>
                            <FiZap className={styles.badgeIconSmall} />
                            LIVE
                          </span>
                        ) : (
                          <span className={styles.badgeEnded}>
                            <FiLock className={styles.badgeIconSmall} />
                            ENDED
                          </span>
                        )}
                      </div>

                      {p.images && p.images.length > 1 && (
                        <div className={styles.imageCount}>
                          <FiGrid className={styles.imageCountIcon} />
                          {p.images.length}
                        </div>
                      )}

                      <div className={styles.imageOverlay}></div>
                    </div>

                    {/* Content */}
                    <div className={styles.productContent}>
                      <h3 className={styles.productTitle}>{p.title}</h3>
                      <p className={styles.productDesc}>
                        {p.description.length > 100
                          ? p.description.substring(0, 100) + "..."
                          : p.description}
                      </p>

                      {/* Bid Info */}
                      <div className={styles.bidInfo}>
                        <div className={styles.bidItem}>
                          <span className={styles.bidLabel}>
                            <FiDollarSign className={styles.bidIcon} />
                            Starting
                          </span>
                          <span className={styles.bidValue}>
                            ${p.startingBid}
                          </span>
                        </div>
                        <div className={styles.bidItem}>
                          <span className={styles.bidLabel}>
                            <FiTrendingUp className={styles.bidIcon} />
                            {isSold ? "Final" : "Current"}
                          </span>
                          <span className={styles.bidCurrent}>
                            ${p.currentBid}
                          </span>
                        </div>
                      </div>

                      {/* Sold Info */}
                      {isSold && p.sellerPayout && (
                        <div className={styles.payoutInfo}>
                          <div className={styles.payoutItem}>
                            <FiDollarSign className={styles.payoutIcon} />
                            <div className={styles.payoutDetails}>
                              <span className={styles.payoutLabel}>
                                Your Payout
                              </span>
                              <span className={styles.payoutValue}>
                                ${p.sellerPayout.toFixed(2)}
                              </span>
                            </div>
                          </div>
                          {p.deliveryStatus && (
                            <div className={styles.deliveryStatus}>
                              <FiTruck className={styles.deliveryIcon} />
                              <span>{p.deliveryStatus}</span>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Meta */}
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

                      {/* Actions */}
                      <div className={styles.productActions}>
                        {canRequestDelivery && (
                          <button
                            onClick={() => handleRequestDelivery(p.id, p.title)}
                            disabled={requestingDelivery === p.id}
                            className={styles.deliveryBtn}
                          >
                            <FiTruck className={styles.btnIcon} />
                            {requestingDelivery === p.id
                              ? "Requesting..."
                              : "Request Delivery"}
                          </button>
                        )}

                        <div className={styles.actionGroup}>
                          {isActive && (
                            <button
                              onClick={() => handleEditClick(p.id)}
                              className={styles.editBtn}
                            >
                              <FiEdit3 className={styles.btnIcon} />
                              Edit
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteClick(p.id, p.title)}
                            disabled={deleteLoading === p.id}
                            className={styles.deleteBtn}
                          >
                            <FiTrash2 className={styles.btnIcon} />
                            {deleteLoading === p.id ? "Deleting..." : "Delete"}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}