//CreateProductForm.tsx:
"use client";

import { useEffect, useRef, useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import styles from "./ProductCreateStyle.module.css";
import { useTheme } from "next-themes";

/* =========================
   STAR ANIMATION STATE
   ========================= */
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
  isDarkRef: { current: boolean } | null;

  constructor(
    ctx: CanvasRenderingContext2D,
    isDarkRef: { current: boolean } | null
  ) {
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

    // draw a subtle halo + core depending on theme to keep visibility in both modes
    if (isDark) {
      // dark: green halo + bright core
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
      // light: subtle green core (matches light mode look)
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

export default function CreateProductForm({
  unauthorized = false,
}: {
  unauthorized?: boolean;
}) {
  const router = useRouter();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { resolvedTheme } = useTheme();
  const isDarkRef = useRef(false);

  useEffect(() => {
    isDarkRef.current = resolvedTheme === "dark";
  }, [resolvedTheme]);

  /* =========================
     STAR CANVAS EFFECT
     ========================= */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    animationState.dpr = Math.min(window.devicePixelRatio || 1, 2);

    const resize = () => {
      animationState.w = window.innerWidth;
      animationState.h = window.innerHeight;
      canvas.width = Math.floor(animationState.w * animationState.dpr);
      canvas.height = Math.floor(animationState.h * animationState.dpr);
      canvas.style.width = `${animationState.w}px`;
      canvas.style.height = `${animationState.h}px`;
      ctx.setTransform(animationState.dpr, 0, 0, animationState.dpr, 0, 0);
    };

    resize();
    const stars = Array.from({ length: 220 }, () => new Star(ctx, isDarkRef));

    let raf = 0;
    const loop = () => {
      // subtle overlay depending on theme so stars look correct
      if (isDarkRef.current) {
        // dark: slight tint to preserve trailing and contrast
        ctx.fillStyle = "rgba(7,8,10,0.12)";
        ctx.fillRect(0, 0, animationState.w, animationState.h);
      } else {
        // light: keep very subtle
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

    // update stars' isDarkRef when theme changes (reactive)
    const themeObserver = new MutationObserver(() => {
      // no-op here; isDarkRef is updated by useEffect on resolvedTheme
    });

    if (document.documentElement) {
      themeObserver.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ["class"],
      });
    }

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      themeObserver.disconnect();
    };
  }, [resolvedTheme]);

  /* =========================
     FORM LOGIC (UNCHANGED)
     ========================= */
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startingBid, setStartingBid] = useState("");
  const [auctionEnd, setAuctionEnd] = useState("");
  const [location, setLocation] = useState<"Beirut" | "Outside Beirut">(
    "Beirut"
  );
  const [images, setImages] = useState<File[]>([]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const urls: string[] = [];
      for (const img of images) {
        const fd = new FormData();
        fd.append("file", img);
        const r = await fetch("/api/upload", { method: "POST", body: fd });
        if (!r.ok) throw new Error("Upload failed");
        urls.push((await r.json()).url);
      }

      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          startingBid: parseFloat(startingBid),
          auctionEnd: new Date(auctionEnd),
          location,
          images: urls,
        }),
      });

      if (!res.ok) throw new Error("Creation failed");

      setSuccess("Product created successfully!");
      setTimeout(() => router.push("/products/my-products"), 2000);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.mainContainer}>
      <div className={styles.bgGradient} />
      <canvas ref={canvasRef} className={styles.starsBg} />

      <div className={styles.content}>
        <div className={styles.formCard}>
          {unauthorized ? (
            <>
              <h1 className={styles.title}>Unauthorized</h1>
              <p className={styles.subtitle}>
                You must be logged in to create a product.
              </p>
              <button
                className={styles.primaryButton}
                onClick={() => router.push("/login")}
              >
                Go to Login
              </button>
            </>
          ) : (
            <>
              <h1 className={styles.title}>Create Product</h1>
              {error && <div className={styles.error}>{error}</div>}
              {success && <div className={styles.success}>{success}</div>}

              <form className={styles.form} onSubmit={handleSubmit}>
                <label>
                  Title
                  <input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />
                </label>
                <label>
                  Description
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                  />
                </label>
                <label>
                  Starting Bid
                  <input
                    type="number"
                    value={startingBid}
                    onChange={(e) => setStartingBid(e.target.value)}
                    required
                  />
                </label>
                <label>
                  Auction End
                  <input
                    type="datetime-local"
                    value={auctionEnd}
                    onChange={(e) => setAuctionEnd(e.target.value)}
                    required
                  />
                </label>
                <label>
                  Location
                  <select
                    value={location}
                    onChange={(e) => setLocation(e.target.value as any)}
                  >
                    <option>Beirut</option>
                    <option>Outside Beirut</option>
                  </select>
                </label>
                <label>
                  Images
                  <input
                    type="file"
                    multiple
                    onChange={(e) =>
                      setImages(Array.from(e.target.files || []))
                    }
                  />
                </label>

                <button className={styles.primaryButton} disabled={loading}>
                  {loading ? "Creating..." : "Create Product"}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}