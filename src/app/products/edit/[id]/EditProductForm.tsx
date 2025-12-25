"use client";

import { useState, useEffect, FormEvent, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  FiPackage,
  FiFileText,
  FiDollarSign,
  FiClock,
  FiMapPin,
  FiImage,
  FiSave,
  FiX,
  FiCheckCircle,
  FiAlertCircle,
  FiMoreHorizontal,
} from "react-icons/fi";
import styles from "./ProductEditStyle.module.css";
import { useTheme } from "next-themes";

// --- STAR ANIMATION STATE ---
const animationState = {
  w: 0,
  h: 0,
  dpr: 1,
};

class Star {
  ctx: CanvasRenderingContext2D;
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  a: number;
  private isDarkRef?: { current: boolean };

  constructor(ctx: CanvasRenderingContext2D, isDarkRef?: { current: boolean }) {
    this.ctx = ctx;
    this.isDarkRef = isDarkRef;
    this.x = Math.random() * animationState.w;
    this.y = Math.random() * animationState.h;
    this.vx = (Math.random() - 0.5) * 0.12;
    this.vy = (Math.random() - 0.5) * 0.12;
    this.r = Math.random() * 1.4 + 0.6;
    this.a = Math.random() * 0.25 + 0.1;
  }

  step() {
    this.x += this.vx;
    this.y += this.vy;

    if (this.x < 0) this.x = animationState.w;
    if (this.x > animationState.w) this.x = 0;
    if (this.y < 0) this.y = animationState.h;
    if (this.y > animationState.h) this.y = 0;
  }

  draw() {
    this.ctx.save();
    this.ctx.globalAlpha = this.a;

    const isDark = this.isDarkRef?.current ?? false;

    // Theme-aware drawing: keep green halo, core adjusts for contrast
    if (isDark) {
      const grad = this.ctx.createRadialGradient(
        this.x,
        this.y,
        0,
        this.x,
        this.y,
        Math.max(6, this.r * 4)
      );
      grad.addColorStop(0, `rgba(16,185,129,${Math.min(0.9, this.a * 2)})`);
      grad.addColorStop(0.6, `rgba(16,185,129,${Math.min(0.45, this.a)})`);
      grad.addColorStop(1, "rgba(16,185,129,0)");
      this.ctx.beginPath();
      this.ctx.fillStyle = grad;
      this.ctx.arc(this.x, this.y, Math.max(6, this.r * 4), 0, Math.PI * 2);
      this.ctx.fill();

      this.ctx.beginPath();
      this.ctx.fillStyle = `rgba(246,247,249,${Math.min(1, this.a + 0.15)})`;
      this.ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      this.ctx.fill();
    } else {
      const grad = this.ctx.createRadialGradient(
        this.x,
        this.y,
        0,
        this.x,
        this.y,
        Math.max(5, this.r * 3)
      );
      grad.addColorStop(0, `rgba(16,185,129,${Math.min(0.8, this.a * 1.6)})`);
      grad.addColorStop(0.6, `rgba(16,185,129,${Math.min(0.35, this.a)})`);
      grad.addColorStop(1, "rgba(16,185,129,0)");
      this.ctx.beginPath();
      this.ctx.fillStyle = grad;
      this.ctx.arc(this.x, this.y, Math.max(5, this.r * 3), 0, Math.PI * 2);
      this.ctx.fill();

      this.ctx.beginPath();
      this.ctx.fillStyle = `rgba(15,23,42,${Math.min(1, this.a + 0.05)})`;
      this.ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      this.ctx.fill();
    }

    this.ctx.restore();
  }
}

// Define Product interface to match database schema
interface Product {
  id: string;
  title: string;
  description: string;
  images: string[];
  startingBid: number;
  currentBid: number;
  auctionEnd: string;
  location: "Beirut" | "Outside Beirut";
  status: string;
}

interface EditProductFormProps {
  productId: string;
}

export default function EditProductForm({ productId }: EditProductFormProps) {
  const router = useRouter();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { resolvedTheme } = useTheme();
  const isDarkRef = useRef(false);

  // Loading and error states
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Form field states
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startingBid, setStartingBid] = useState("");
  const [auctionEnd, setAuctionEnd] = useState("");
  const [location, setLocation] = useState<"Beirut" | "Outside Beirut">(
    "Beirut"
  );

  // Image handling states
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [newImages, setNewImages] = useState<File[]>([]);
  const [keepExistingImages, setKeepExistingImages] = useState(true);

  useEffect(() => {
    isDarkRef.current = resolvedTheme === "dark";
  }, [resolvedTheme]);

  // --- STAR CANVAS EFFECT ---
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    animationState.dpr = Math.min(window.devicePixelRatio || 1, 2);

    const resize = () => {
      animationState.w = window.innerWidth;
      animationState.h = window.innerHeight;
      canvas.style.width = `${animationState.w}px`;
      canvas.style.height = `${animationState.h}px`;
      canvas.width = Math.floor(animationState.w * animationState.dpr);
      canvas.height = Math.floor(animationState.h * animationState.dpr);
      ctx.setTransform(animationState.dpr, 0, 0, animationState.dpr, 0, 0);
    };

    resize();
    const stars = Array.from({ length: 220 }, () => new Star(ctx, isDarkRef));

    let raf = 0;
    const loop = () => {
      // In dark mode we tint background slightly to preserve trails,
      // in light mode we clear for crisp small dots.
      if (isDarkRef.current) {
        ctx.fillStyle = "rgba(7, 8, 10, 0.12)";
        ctx.fillRect(0, 0, animationState.w, animationState.h);
      } else {
        ctx.clearRect(0, 0, animationState.w, animationState.h);
      }

      stars.forEach((s) => {
        s.step();
        s.draw();
      });
      raf = requestAnimationFrame(loop);
    };

    loop();
    window.addEventListener("resize", resize);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, [resolvedTheme]);

  useEffect(() => {
    fetchProductData();
  }, [productId]);

  const fetchProductData = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await fetch(`/api/products/${productId}`);

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || "Failed to fetch product");
      }

      const product: Product = await res.json();

      setTitle(product.title);
      setDescription(product.description);
      setStartingBid(product.startingBid.toString());
      setLocation(product.location);
      setExistingImages(product.images || []);

      const auctionDate = new Date(product.auctionEnd);
      const formattedDate = auctionDate.toISOString().slice(0, 16);
      setAuctionEnd(formattedDate);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load product");
    } finally {
      setLoading(false);
    }
  };

  const handleNewImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setNewImages(Array.from(e.target.files));
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    setSuccess("");

    try {
      let finalImages: string[] = [];

      if (keepExistingImages) {
        finalImages = [...existingImages];
      }

      if (newImages.length > 0) {
        for (const image of newImages) {
          const formData = new FormData();
          formData.append("file", image);

          const uploadRes = await fetch("/api/upload", {
            method: "POST",
            body: formData,
          });

          if (!uploadRes.ok) {
            const errData = await uploadRes.json();
            throw new Error(errData.message || "Image upload failed");
          }

          const uploadData = await uploadRes.json();
          finalImages.push(uploadData.url);
        }
      }

      const updatedProductData = {
        title,
        description,
        startingBid: parseFloat(startingBid),
        auctionEnd: new Date(auctionEnd).toISOString(),
        location,
        images: finalImages.length > 0 ? finalImages : undefined,
      };

      const productRes = await fetch(`/api/products/${productId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedProductData),
      });

      if (!productRes.ok) {
        const errData = await productRes.json();
        if (errData.errors) {
          const errorMessages = Object.entries(errData.errors)
            .map(
              ([field, msgs]) =>
                `${field}: ${Array.isArray(msgs) ? msgs.join(", ") : msgs}`
            )
            .join("\n");
          throw new Error(`Validation failed:\n${errorMessages}`);
        }
        throw new Error(errData.message || "Product update failed");
      }

      setSuccess("Product updated successfully!");
      setTimeout(() => {
        router.push("/products/my-products");
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={styles.mainContainer}>
      <div className={styles.bgGradient} />
      <canvas ref={canvasRef} className={styles.starsBg} />

      <div className={styles.content}>
        <div className={styles.formCard}>
          <h1 className={styles.title}>Edit Product</h1>
          <p className={styles.subtitle}>
            Update your auction details and images to keep your listing accurate
            and engaging.
          </p>

          {loading ? (
            <div className={styles.loadingOverlay}>
              <div className={styles.spinner}></div>
              <p>Loading product data...</p>
            </div>
          ) : (
            <>
              {error && (
                <div className={styles.error}>
                  <FiAlertCircle />
                  <span>{error}</span>
                </div>
              )}

              {success && (
                <div className={styles.success}>
                  <FiCheckCircle />
                  <span>{success}</span>
                </div>
              )}

              <form className={styles.form} onSubmit={handleSubmit}>
                {/* Title */}
                <div className={styles.formGroup}>
                  <label className={styles.label}>
                    <FiPackage className={styles.labelIcon} />
                    Title
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    className={styles.input}
                    placeholder="Enter product title"
                  />
                </div>

                {/* Description */}
                <div className={styles.formGroup}>
                  <label className={styles.label}>
                    <FiFileText className={styles.labelIcon} />
                    Description
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                    rows={4}
                    className={styles.textarea}
                    placeholder="Describe your item..."
                  />
                </div>

                {/* Starting Bid */}
                <div className={styles.formGroup}>
                  <label className={styles.label}>
                    <FiDollarSign className={styles.labelIcon} />
                    Starting Bid ($)
                  </label>
                  <input
                    type="number"
                    value={startingBid}
                    onChange={(e) => setStartingBid(e.target.value)}
                    required
                    min="0"
                    step="0.01"
                    className={styles.input}
                    placeholder="0.00"
                  />
                </div>

                {/* Auction End */}
                <div className={styles.formGroup}>
                  <label className={styles.label}>
                    <FiClock className={styles.labelIcon} />
                    Auction End Date
                  </label>
                  <input
                    type="datetime-local"
                    value={auctionEnd}
                    onChange={(e) => setAuctionEnd(e.target.value)}
                    required
                    className={styles.input}
                  />
                </div>

                {/* Location */}
                <div className={styles.formGroup}>
                  <label className={styles.label}>
                    <FiMapPin className={styles.labelIcon} />
                    Location
                  </label>
                  <select
                    value={location}
                    onChange={(e) =>
                      setLocation(e.target.value as "Beirut" | "Outside Beirut")
                    }
                    required
                    className={styles.select}
                  >
                    <option value="Beirut">Beirut</option>
                    <option value="Outside Beirut">Outside Beirut</option>
                  </select>
                </div>

                {/* Existing Images */}
                {existingImages.length > 0 && (
                  <div className={styles.formGroup}>
                    <label className={styles.sectionTitle}>
                      <FiImage className={styles.labelIcon} />
                      Current Images
                    </label>
                    <div className={styles.imageGrid}>
                      {existingImages.map((img, index) => (
                        <img
                          key={index}
                          src={img}
                          alt={`Product ${index + 1}`}
                          className={styles.previewImage}
                        />
                      ))}
                    </div>

                    <label className={styles.toggleWrapper}>
                      <input
                        type="checkbox"
                        checked={keepExistingImages}
                        onChange={(e) =>
                          setKeepExistingImages(e.target.checked)
                        }
                        className={styles.checkbox}
                      />
                      <span className={styles.toggleText}>
                        Keep existing images
                      </span>
                    </label>
                  </div>
                )}

                {/* New Images */}
                <div className={styles.formGroup}>
                  <label className={styles.label}>
                    <FiMoreHorizontal className={styles.labelIcon} />
                    Add New Images (optional)
                  </label>
                  <input
                    type="file"
                    onChange={handleNewImageChange}
                    accept="image/*"
                    multiple
                    className={styles.input}
                  />
                  {newImages.length > 0 && (
                    <p
                      style={{
                        marginTop: "5px",
                        fontSize: "14px",
                        color: "#10b981",
                        fontWeight: 700,
                      }}
                    >
                      {newImages.length} new image(s) selected
                    </p>
                  )}
                </div>

                <div className={styles.buttonGroup}>
                  <button
                    type="submit"
                    className={styles.primaryButton}
                    disabled={submitting}
                  >
                    {submitting ? (
                      <>Updating...</>
                    ) : (
                      <>
                        <FiSave />
                        Update Product
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => router.push("/products/my-products")}
                    className={styles.secondaryButton}
                  >
                    <FiX />
                    Cancel
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}