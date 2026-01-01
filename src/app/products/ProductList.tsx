"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
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
  FiImage,
  FiX,
} from "react-icons/fi";
import styles from "./ProductsList.module.css";
import { useAuth } from "@/hooks/useAuth";
import SearchBar from "@/components/SearchBar/SearchBar";
import { useTheme } from "next-themes";

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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedGalleryProduct, setSelectedGalleryProduct] =
    useState<Product | null>(null);
  const [selectedDetailImage, setSelectedDetailImage] = useState<string | null>(
    null
  );
  const [bidAmount, setBidAmount] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [scrollTopVisible, setScrollTopVisible] = useState(false);
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [modalConfig, setModalConfig] = useState<{
    title: string;
    message: string;
    confirmText: string;
    onConfirm: () => void;
    variant: "success" | "error";
  }>({
    title: "",
    message: "",
    confirmText: "",
    onConfirm: () => { },
    variant: "success",
  });

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { resolvedTheme } = useTheme();
  const isDarkRef = useRef(false);

  // Keep theme ref updated so animation loop can read it without re-creating heavy state
  useEffect(() => {
    isDarkRef.current = resolvedTheme === "dark";
  }, [resolvedTheme]);

  // Enhanced star animation with glow effects
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

    for (let i = 0; i < 200; i++) {
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

    let animationFrame = 0;
    let rafId = 0;

    function animate() {
      if (!ctx || !canvas) return;
      animationFrame++;

      // In dark mode draw a subtle dark overlay to create trailing, otherwise clear
      if (isDarkRef.current) {
        ctx.fillStyle = "rgba(7, 8, 10, 0.12)";
        ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);
      } else {
        ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      }

      stars.forEach((star) => {
        star.x += star.vx;
        star.y += star.vy;

        if (star.x < 0 || star.x > window.innerWidth) star.vx *= -1;
        if (star.y < 0 || star.y > window.innerHeight) star.vy *= -1;

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

        if (isDarkRef.current) {
          // Dark theme: stronger green halo
          gradient.addColorStop(0, `rgba(16, 185, 129, ${currentAlpha * 0.9})`);
          gradient.addColorStop(
            0.5,
            `rgba(16, 185, 129, ${currentAlpha * 0.35})`
          );
        } else {
          // Light theme: softer halo
          gradient.addColorStop(0, `rgba(16, 185, 129, ${currentAlpha * 0.8})`);
          gradient.addColorStop(
            0.5,
            `rgba(16, 185, 129, ${currentAlpha * 0.3})`
          );
        }
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
      });

      rafId = requestAnimationFrame(animate);
    }

    animate();

    const handleResize = () => {
      resize();
      // rebuild stars positions to fill new viewport adequately
      stars.length = 0;
      for (let i = 0; i < 200; i++) {
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

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [resolvedTheme]);

  useEffect(() => {
    const handleScroll = () => {
      setScrollTopVisible(window.scrollY > 400);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    // Fetch products whenever the URL search params change (or on mount)
    // Guests can now fetch products too!
    const query = searchParams.get("q");
    fetchProducts(query);
  }, [searchParams]);

  const fetchProducts = async (searchQuery: string | null = null) => {
    try {
      setLoading(true);

      const url = searchQuery
        ? `/api/products?q=${encodeURIComponent(searchQuery)}`
        : "/api/products";

      const res = await fetch(url);
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
    if (unauthorized) {
      router.push("/login");
      return;
    }

    if (!selectedProduct) return;
    // ... (rest of search/logic remains same)

    const bid = parseFloat(bidAmount);
    if (isNaN(bid) || bid <= 0) {
      setModalConfig({
        title: "Invalid Bid",
        message: "Please enter a valid bid amount.",
        confirmText: "OK",
        variant: "error",
        onConfirm: () => setModalOpen(false),
      });
      setModalOpen(true);
      return;
    }

    // Strict Validation: Bid must be > startingBid AND > currentBid
    // Example: Start 100, Current 0 -> Min Bid > 100 (e.g. 101)
    // Example: Start 100, Current 120 -> Min Bid > 120 (e.g. 121)

    if (bid <= selectedProduct.startingBid) {
      setModalConfig({
        title: "Bid Too Low",
        message: `Bid amount must be greater than the starting bid of $${selectedProduct.startingBid}.`,
        confirmText: "OK",
        variant: "error",
        onConfirm: () => setModalOpen(false),
      });
      setModalOpen(true);
      return;
    }

    if (bid <= selectedProduct.currentBid) {
      setModalConfig({
        title: "Bid Too Low",
        message: `Bid amount must be higher than the current bid of $${selectedProduct.currentBid}.`,
        confirmText: "OK",
        variant: "error",
        onConfirm: () => setModalOpen(false),
      });
      setModalOpen(true);
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
        setModalConfig({
          title: "Bid Failed",
          message: data.message ?? "An error occurred while placing your bid.",
          confirmText: "OK",
          variant: "error",
          onConfirm: () => setModalOpen(false),
        });
        setModalOpen(true);
        return;
      }

      setModalConfig({
        title: "Bid Placed Successfully",
        message: "Your bid has been placed successfully!",
        confirmText: "Perfect",
        variant: "success",
        onConfirm: () => {
          setModalOpen(false);
          setSelectedProduct(null);
          setBidAmount("");
          // Refresh list, keeping current search if any
          const query = searchParams.get("q");
          fetchProducts(query);
        },
      });
      setModalOpen(true);
    } catch (err) {
      setModalConfig({
        title: "Bid Failed",
        message: "An unexpected error occurred. Please try again.",
        confirmText: "OK",
        variant: "error",
        onConfirm: () => setModalOpen(false),
      });
      setModalOpen(true);
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

  if (loading) {
    // ...
  }

  // ... (error handling)

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
            <SearchBar />
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

                  {searchParams.get("q") && (
                    <button
                      onClick={() => {
                        router.push("/products");
                      }}
                      className={styles.clearSearchBtn}
                    >
                      <FiXCircle className={styles.btnIcon} />
                      Clear Search
                    </button>
                  )}
                </div>
                {/* Only show create button for authorized users */}
                {!unauthorized && (
                  <Link href="/products/create" className={styles.createBtn}>
                    <FiPlusCircle className={styles.btnIcon} />
                    Create New Auction
                  </Link>
                )}
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

                    {/* Seller Info Section - restricted for unauthorized */}
                    {p.seller && (
                      <div className={styles.sellerSection}>
                        <div className={styles.sellerHeader}>
                          <FiUser className={styles.sellerIcon} />
                          <span className={styles.sellerName}>
                            {p.seller.profile?.firstName}{" "}
                            {p.seller.profile?.lastName}
                          </span>
                        </div>
                        {!unauthorized && (
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
                        )}
                        {unauthorized && (
                          <div className={styles.guestSellerRestriction}>
                            <FiLock className={styles.guestIcon} />
                            <span>Login to view contact details</span>
                          </div>
                        )}
                      </div>
                    )}

                    <button
                      onClick={() => {
                        if (unauthorized) {
                          router.push("/login");
                        } else {
                          setSelectedProduct(p);
                          setBidAmount("");
                        }
                      }}
                      className={
                        p.sellerId === user?.id
                          ? styles.sellerSelfBidBtn
                          : styles.bidBtn
                      }
                      disabled={p.sellerId === user?.id && !unauthorized}
                    >
                      {unauthorized ? (
                        <>
                          <FiLock className={styles.btnIcon} />
                          Login to Place Bid
                        </>
                      ) : p.sellerId === user?.id ? (
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

                  {searchParams.get("q") && (
                    <button
                      onClick={() => {
                        router.push("/products");
                      }}
                      className={styles.clearSearchBtn}
                    >
                      <FiXCircle className={styles.btnIcon} />
                      Clear Search
                    </button>
                  )}
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
                  placeholder={`Min: ${Math.max(
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

      {/* Success/Error Modal */}
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
                  modalConfig.variant === "success"
                    ? styles.modalIconSuccess
                    : styles.modalIconError
                }
              >
                {modalConfig.variant === "success" ? (
                  <FiCheckCircle />
                ) : (
                  <FiXCircle />
                )}
              </div>
              <h2 className={styles.modalTitle}>{modalConfig.title}</h2>
            </div>
            <p className={styles.modalMessage}>{modalConfig.message}</p>
            <div className={styles.modalActions}>
              <button
                className={styles.modalConfirmBtnPrimary}
                onClick={() => {
                  modalConfig.onConfirm();
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

      {/* Scroll to Top */}
      <button
        onClick={scrollToTop}
        className={`${styles.scrollTop} ${scrollTopVisible ? styles.scrollTopVisible : ""
          }`}
      >
        <FiArrowUp />
      </button>
    </div>
  );
}
