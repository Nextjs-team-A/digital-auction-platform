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
  FiImage,
  FiX,
} from "react-icons/fi";
import styles from "./MyProductsUI.module.css";
import SearchBar from "@/components/SearchBar/SearchBar";
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

  // Gallery State
  const [selectedGalleryProduct, setSelectedGalleryProduct] =
    useState<Product | null>(null);
  const [selectedDetailImage, setSelectedDetailImage] = useState<string | null>(
    null
  );

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [modalConfig, setModalConfig] = useState<{
    title: string;
    message: string;
    confirmText: string;
    onConfirm: () => void;
    variant: "danger" | "primary" | "success" | "error";
  }>({
    title: "",
    message: "",
    confirmText: "",
    onConfirm: () => {},
    variant: "primary",
  });

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
      setModalConfig({
        title: "Product Deleted",
        message:
          "The product has been successfully removed from the marketplace.",
        confirmText: "Perfect",
        variant: "success",
        onConfirm: () => setModalOpen(false),
      });
      setModalOpen(true);
    } catch (err) {
      setModalConfig({
        title: "Deletion Failed",
        message:
          err instanceof Error
            ? err.message
            : "An unexpected error occurred while deleting.",
        confirmText: "Back",
        variant: "error",
        onConfirm: () => setModalOpen(false),
      });
      setModalOpen(true);
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
          `rgba(16, 185, 129, ${
            currentAlpha * (isDarkRef.current ? 0.9 : 0.8)
          })`
        );
        gradient.addColorStop(
          0.5,
          `rgba(16, 185, 129, ${
            currentAlpha * (isDarkRef.current ? 0.35 : 0.3)
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
    setModalConfig({
      title: "Delete Product",
      message: `Are you sure you want to delete "${productTitle}"? This action cannot be undone and will remove the product from the marketplace.`,
      confirmText: "Delete Product",
      variant: "danger",
      onConfirm: () => handleDelete(productId),
    });
    setModalOpen(true);
  };

  const handleRequestDelivery = async (
    productId: string,
    productTitle: string
  ) => {
    setModalConfig({
      title: "Request Delivery",
      message: `Request delivery for "${productTitle}"? Ahmad Delivery will be notified to pick up this item from your location.`,
      confirmText: "Confirm Request",
      variant: "primary",
      onConfirm: async () => {
        try {
          setRequestingDelivery(productId);

          const res = await fetch(
            `/api/products/${productId}/request-delivery`,
            {
              method: "POST",
            }
          );

          const data = await res.json();

          if (!res.ok) {
            throw new Error(data.message || "Failed to request delivery");
          }

          setModalConfig({
            title: "Request Sent",
            message:
              "✅ Delivery requested successfully!\nAhmad Delivery will contact you soon to coordinate the pick-up.",
            confirmText: "Got it!",
            variant: "success",
            onConfirm: () => window.location.reload(),
          });
          setModalOpen(true);
        } catch (err) {
          setModalConfig({
            title: "Request Failed",
            message:
              err instanceof Error
                ? err.message
                : "Failed to notify Ahmad Delivery. Please try again.",
            confirmText: "Close",
            variant: "error",
            onConfirm: () => setModalOpen(false),
          });
          setModalOpen(true);
          console.error("Request delivery error:", err);
        } finally {
          setRequestingDelivery(null);
        }
      },
    });
    setModalOpen(true);
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
                    className={`${styles.productCard} ${
                      !isActive ? styles.productCardEnded : ""
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

                      {p.images && p.images.length > 0 && (
                        <button
                          className={styles.viewGalleryBtn}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedGalleryProduct(p);
                          }}
                        >
                          <FiImage className={styles.galleryIcon} />
                          Show All
                        </button>
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

      {/* Confirmation Modal */}
      {modalOpen && (
        <div
          className={styles.modalOverlay}
          onClick={() => setModalOpen(false)}
        >
          <div
            className={styles.modalCard}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.modalHeader}>
              <div
                className={
                  modalConfig.variant === "danger"
                    ? styles.modalIconDanger
                    : modalConfig.variant === "success"
                    ? styles.modalIconSuccess
                    : modalConfig.variant === "error"
                    ? styles.modalIconError
                    : styles.modalIconPrimary
                }
              >
                {modalConfig.variant === "danger" ? (
                  <FiTrash2 />
                ) : modalConfig.variant === "success" ? (
                  <FiCheckCircle />
                ) : modalConfig.variant === "error" ? (
                  <FiAlertCircle />
                ) : (
                  <FiTruck />
                )}
              </div>
              <h2 className={styles.modalTitle}>{modalConfig.title}</h2>
            </div>
            <p className={styles.modalMessage}>{modalConfig.message}</p>
            <div className={styles.modalActions}>
              {modalConfig.variant !== "success" &&
                modalConfig.variant !== "error" && (
                  <button
                    className={styles.modalCancelBtn}
                    onClick={() => setModalOpen(false)}
                  >
                    Cancel
                  </button>
                )}
              <button
                className={
                  modalConfig.variant === "danger"
                    ? styles.modalConfirmBtnDanger
                    : modalConfig.variant === "error"
                    ? styles.modalConfirmBtnDanger
                    : styles.modalConfirmBtnPrimary
                }
                onClick={() => {
                  modalConfig.onConfirm();
                  if (
                    modalConfig.variant !== "success" &&
                    modalConfig.variant !== "error"
                  ) {
                    setModalOpen(false);
                  }
                }}
              >
                {modalConfig.confirmText}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Gallery Modal */}
      {selectedGalleryProduct && (
        <div className={styles.galleryOverlay}>
          <div className={styles.galleryContainer}>
            <div className={styles.galleryHeader}>
              <h2 className={styles.galleryTitle}>
                <FiImage className={styles.galleryTitleIcon} />
                {selectedGalleryProduct.title} - Gallery
              </h2>
              <button
                className={styles.galleryClose}
                onClick={() => setSelectedGalleryProduct(null)}
              >
                <FiX />
              </button>
            </div>
            <div className={styles.galleryBody}>
              <div className={styles.galleryGrid}>
                {selectedGalleryProduct.images.map((img, idx) => (
                  <div
                    key={idx}
                    className={styles.galleryItem}
                    onClick={() => setSelectedDetailImage(img)}
                  >
                    <img
                      src={img}
                      alt={`${selectedGalleryProduct.title} - ${idx + 1}`}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Detail View Overlay */}
      {selectedDetailImage && (
        <div
          className={styles.detailOverlay}
          onClick={() => setSelectedDetailImage(null)}
        >
          <button
            className={styles.detailCloseBtn}
            onClick={() => setSelectedDetailImage(null)}
          >
            <FiX />
          </button>
          <div
            className={styles.detailImageContainer}
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={selectedDetailImage}
              alt="Detail View"
              className={styles.detailImage}
            />
          </div>
        </div>
      )}
    </div>
  );
}
