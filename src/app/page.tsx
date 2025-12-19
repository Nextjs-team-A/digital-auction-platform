"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useAuth } from "@/hooks/useAuth";
import styles from "./page.module.css";

import {
  FaBolt,
  FaRegListAlt,
  FaLeaf,
  FaUsers,
  FaTruck,
  FaHeadset,
  FaSearch,
  FaGavel,
  FaCheckCircle,
  FaMapMarkerAlt,
  FaLock,
  FaUserCheck,
  FaChartLine,
} from "react-icons/fa";

// Keep ssr:false, but render it only after mount to avoid hydration mismatch
const Header = dynamic(() => import("../components/Header"), { ssr: false });

type Step = { title: string; text: string; icon: React.ReactNode };
type Feature = { title: string; text: string; icon: React.ReactNode };

const animationState = {
  w: 0,
  h: 0,
  dpr: 1,
  reducedMotion: false,
  pointer: {
    x: 0,
    y: 0,
    vx: 0,
    vy: 0,
    active: false,
    down: false,
    lastX: 0,
    lastY: 0,
  },
};

class Star {
  private c: CanvasRenderingContext2D;
  layer: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  a: number;

  constructor(ctx: CanvasRenderingContext2D, layer: number) {
    this.c = ctx;
    this.layer = layer;
    this.x = Math.random() * animationState.w;
    this.y = Math.random() * animationState.h;

    const baseSpeed = layer === 0 ? 0.05 : layer === 1 ? 0.09 : 0.13;
    this.vx = (Math.random() - 0.5) * baseSpeed;
    this.vy = (Math.random() - 0.5) * baseSpeed;

    const baseR = layer === 0 ? 0.7 : layer === 1 ? 1.0 : 1.4;
    this.r = baseR + Math.random() * 0.9;

    this.a =
      (layer === 0 ? 0.12 : layer === 1 ? 0.16 : 0.22) + Math.random() * 0.12;
  }

  step() {
    if (animationState.reducedMotion) return;

    this.x += this.vx;
    this.y += this.vy;

    if (animationState.pointer.active) {
      const dx = animationState.pointer.x - this.x;
      const dy = animationState.pointer.y - this.y;
      const dist = Math.sqrt(dx * dx + dy * dy) || 1;
      const pullRadius = 260;

      if (dist < pullRadius) {
        const closeness = 1 - dist / pullRadius;
        const pull = (animationState.pointer.down ? 0.18 : 0.08) * closeness;
        const layerBoost =
          this.layer === 2 ? 1.25 : this.layer === 1 ? 1.0 : 0.75;

        this.vx += (dx / dist) * pull * layerBoost;
        this.vy += (dy / dist) * pull * layerBoost;

        this.vx += animationState.pointer.vx * 0.012 * layerBoost;
        this.vy += animationState.pointer.vy * 0.012 * layerBoost;
      }
    }

    this.vx *= 0.985;
    this.vy *= 0.985;

    if (this.x < -30) this.x = animationState.w + 30;
    if (this.x > animationState.w + 30) this.x = -30;
    if (this.y < -30) this.y = animationState.h + 30;
    if (this.y > animationState.h + 30) this.y = -30;
  }

  draw() {
    this.c.save();
    this.c.globalAlpha = this.a;
    this.c.fillStyle = "rgba(15, 23, 42, 0.90)";
    this.c.beginPath();
    this.c.arc(this.x, this.y, this.r, 0, Math.PI * 2);
    this.c.fill();
    this.c.restore();
  }
}

class ShootingStar {
  private c: CanvasRenderingContext2D;
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  len: number;

  constructor(ctx: CanvasRenderingContext2D) {
    this.c = ctx;
    const fromLeft = Math.random() < 0.5;
    this.x = fromLeft ? -80 : Math.random() * animationState.w;
    this.y = fromLeft ? Math.random() * (animationState.h * 0.55) : -80;

    const speed = 9 + Math.random() * 6;
    const angle = (Math.PI * (35 + Math.random() * 20)) / 180;

    this.vx = Math.cos(angle) * speed;
    this.vy = Math.sin(angle) * speed;

    this.maxLife = 55 + Math.random() * 35;
    this.life = this.maxLife;
    this.len = 120 + Math.random() * 140;
  }

  step() {
    if (animationState.reducedMotion) return;
    this.x += this.vx;
    this.y += this.vy;
    this.life -= 1;
  }

  draw() {
    const t = this.life / this.maxLife;
    if (t <= 0) return;

    const x2 = this.x - (this.vx / 12) * this.len;
    const y2 = this.y - (this.vy / 12) * this.len;

    this.c.save();
    this.c.globalAlpha = 0.55 * t;

    const grad = this.c.createLinearGradient(this.x, this.y, x2, y2);
    grad.addColorStop(0, "rgba(16,185,129,0.0)");
    grad.addColorStop(0.45, "rgba(16,185,129,0.35)");
    grad.addColorStop(1, "rgba(15,23,42,0.55)");

    this.c.strokeStyle = grad;
    this.c.lineWidth = 2;
    this.c.beginPath();
    this.c.moveTo(this.x, this.y);
    this.c.lineTo(x2, y2);
    this.c.stroke();

    this.c.globalAlpha = 0.7 * t;
    this.c.fillStyle = "rgba(15,23,42,1)";
    this.c.beginPath();
    this.c.arc(this.x, this.y, 1.7, 0, Math.PI * 2);
    this.c.fill();

    this.c.restore();
  }
}

export default function Home() {
  const { isAuthenticated } = useAuth();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [mounted] = useState(true);
  const [showTop, setShowTop] = useState(false);

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 500);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const whyChoose = useMemo<Feature[]>(
    () => [
      {
        icon: <FaBolt />,
        title: "Fast, smooth experience",
        text: "A clean UI built for speed from browsing to bidding.",
      },
      {
        icon: <FaRegListAlt />,
        title: "Clear auction flow",
        text: "Simple steps, transparent process, no confusion.",
      },
      {
        icon: <FaLeaf />,
        title: "Modern and trustworthy",
        text: "A premium UI that feels safe and professional.",
      },
      {
        icon: <FaUsers />,
        title: "Built for buyers and sellers",
        text: "Bid, buy, or sell with a consistent experience.",
      },
      {
        icon: <FaTruck />,
        title: "Reliable delivery",
        text: "Delivery options with clear pricing and expectations.",
      },
      {
        icon: <FaHeadset />,
        title: "Support and guidance",
        text: "Helpful UX patterns that keep the flow straightforward.",
      },
    ],
    []
  );

  const howItWorks = useMemo<Step[]>(
    () => [
      {
        icon: <FaSearch />,
        title: "Browse items",
        text: "Explore auctions and listings with clear details.",
      },
      {
        icon: <FaGavel />,
        title: "Bid or buy",
        text: "Place bids to compete, or buy directly when available.",
      },
      {
        icon: <FaCheckCircle />,
        title: "Win and checkout",
        text: "If you win, confirm and complete the checkout securely.",
      },
      {
        icon: <FaMapMarkerAlt />,
        title: "Delivery",
        text: "Choose delivery: $3 Beirut, $5 outside Beirut.",
      },
    ],
    []
  );

  // FULL-PAGE BACKGROUND STARS (fixed canvas behind everything)
  useEffect(() => {
    if (!mounted) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    animationState.dpr = Math.min(window.devicePixelRatio || 1, 2);
    animationState.reducedMotion =
      window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false;

    const resize = () => {
      animationState.w = window.innerWidth;
      animationState.h = window.innerHeight;

      if (!animationState.w || !animationState.h) return false;

      canvas.width = Math.floor(animationState.w * animationState.dpr);
      canvas.height = Math.floor(animationState.h * animationState.dpr);
      ctx.setTransform(animationState.dpr, 0, 0, animationState.dpr, 0, 0);

      ctx.clearRect(0, 0, animationState.w, animationState.h);
      return true;
    };

    const stars: Star[] = [];
    let shooters: ShootingStar[] = [];
    let shootCooldown = 0;
    let raf = 0;

    const buildStars = () => {
      stars.length = 0;
      const area = animationState.w * animationState.h;
      const base = Math.max(120, Math.min(280, Math.floor(area / 14000)));

      const far = Math.floor(base * 0.42);
      const mid = Math.floor(base * 0.36);
      const near = base - far - mid;

      for (let i = 0; i < far; i++) stars.push(new Star(ctx, 0));
      for (let i = 0; i < mid; i++) stars.push(new Star(ctx, 1));
      for (let i = 0; i < near; i++) stars.push(new Star(ctx, 2));
    };

    const drawConnections = () => {
      const connect = stars.filter((s) => s.layer >= 1);
      for (let i = 0; i < connect.length; i++) {
        for (let j = i + 1; j < connect.length; j++) {
          const a = connect[i];
          const b = connect[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const d = Math.sqrt(dx * dx + dy * dy);

          const max = 170;
          if (d < max) {
            const alpha = 0.1 * (1 - d / max);
            ctx.strokeStyle = `rgba(16, 185, 129, ${alpha})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }
    };

    const onPointerMove = (e: PointerEvent) => {
      const x = e.clientX;
      const y = e.clientY;

      const dx = x - animationState.pointer.lastX;
      const dy = y - animationState.pointer.lastY;

      animationState.pointer.vx = dx;
      animationState.pointer.vy = dy;
      animationState.pointer.lastX = x;
      animationState.pointer.lastY = y;

      animationState.pointer.x = x;
      animationState.pointer.y = y;
      animationState.pointer.active = true;
    };

    const onPointerDown = () => {
      animationState.pointer.down = true;
      animationState.pointer.active = true;

      if (!animationState.reducedMotion) {
        shooters.push(new ShootingStar(ctx));
        if (shooters.length > 7) shooters.shift();
      }
    };

    const onPointerUp = () => (animationState.pointer.down = false);

    const onPointerLeave = () => {
      animationState.pointer.active = false;
      animationState.pointer.down = false;
      animationState.pointer.vx = 0;
      animationState.pointer.vy = 0;
    };

    const loop = () => {
      ctx.fillStyle = "rgba(255, 255, 255, 0.06)";
      ctx.fillRect(0, 0, animationState.w, animationState.h);

      for (const s of stars) {
        s.step();
        s.draw();
      }

      if (!animationState.reducedMotion) {
        shootCooldown -= 1;
        if (shootCooldown <= 0) {
          if (Math.random() < 0.45) {
            shooters.push(new ShootingStar(ctx));
            if (shooters.length > 7) shooters.shift();
          }
          shootCooldown = 50 + Math.floor(Math.random() * 70);
        }

        shooters.forEach((sh) => sh.step());
        shooters = shooters.filter((sh) => sh.life > 0);
        shooters.forEach((sh) => sh.draw());
      }

      drawConnections();

      animationState.pointer.vx *= 0.85;
      animationState.pointer.vy *= 0.85;

      raf = requestAnimationFrame(loop);
    };

    const onResize = () => {
      if (resize()) buildStars();
    };

    window.addEventListener("resize", onResize, { passive: true });
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("pointerdown", onPointerDown, { passive: true });
    window.addEventListener("pointerup", onPointerUp, { passive: true });
    window.addEventListener("pointercancel", onPointerUp, { passive: true });
    window.addEventListener("pointerleave", onPointerLeave, { passive: true });

    requestAnimationFrame(() => {
      if (resize()) {
        buildStars();
        loop();
      }
    });

    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointerup", onPointerUp);
      window.removeEventListener("pointercancel", onPointerUp);
      window.removeEventListener("pointerleave", onPointerLeave);
      cancelAnimationFrame(raf);
    };
  }, [mounted]);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  return (
    <div className={styles.page}>
      <div className={styles.bgGradient} aria-hidden="true" />

      {/* Render canvas only after mount to avoid hydration mismatch */}
      {mounted && (
        <canvas ref={canvasRef} className={styles.starsBg} aria-hidden="true" />
      )}

      <div className={styles.content} suppressHydrationWarning>
        {/* Render Header only after mount to avoid hydration mismatch */}
        {mounted && <Header />}

        <section className={styles.hero} suppressHydrationWarning>
          <div className={styles.heroInner}>
            <div className={styles.badge}>
              BidZone • Digital Auction Platform
            </div>

            <h1 className={styles.title}>
              Premium auctions, <span>built for trust and speed</span>
            </h1>

            <p className={styles.subtitle}>
              A clean auction experience focused on clarity, performance, and
              secure transactions.
            </p>

            {!isAuthenticated && (
              <div className={styles.heroActions}>
                <Link href="/login" className={styles.primaryBtn}>
                  Login
                </Link>
                <Link href="/register" className={styles.secondaryBtn}>
                  Get Started
                </Link>
              </div>
            )}

            <p className={styles.hint}>
              Move your mouse to pull stars. Click to trigger a shooting star.
            </p>
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Why Choose BidZone</h2>
            <p className={styles.sectionDesc}>
              A premium experience built for clarity, speed, and trust.
            </p>
          </div>

          <div className={styles.cards6}>
            {whyChoose.map((f) => (
              <div key={f.title} className={styles.card}>
                <div className={styles.cardIcon}>{f.icon}</div>
                <h3 className={styles.cardTitle}>{f.title}</h3>
                <p className={styles.cardText}>{f.text}</p>
              </div>
            ))}
          </div>
        </section>

        <section className={`${styles.section} ${styles.altSection}`}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>How It Works</h2>
            <p className={styles.sectionDesc}>
              BidZone supports both bidding and direct purchases.
            </p>
          </div>

          <div className={styles.stepsGrid}>
            {howItWorks.map((s, idx) => (
              <div key={s.title} className={styles.stepCard}>
                <div className={styles.stepLeft}>
                  <div className={styles.stepNum}>{idx + 1}</div>
                  <div className={styles.stepIcon}>{s.icon}</div>
                </div>
                <div>
                  <h3 className={styles.stepTitle}>{s.title}</h3>
                  <p className={styles.stepText}>{s.text}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Security & Trust</h2>
            <p className={styles.sectionDesc}>
              Designed to feel safe, professional, and transparent.
            </p>
          </div>

          <div className={styles.cards3}>
            <div className={styles.trustCard}>
              <div className={styles.trustIcon}>
                <FaLock />
              </div>
              <h3 className={styles.trustTitle}>Secure Payments</h3>
              <p className={styles.trustText}>
                Smooth checkout experience with a security-first mindset.
              </p>
            </div>

            <div className={styles.trustCard}>
              <div className={styles.trustIcon}>
                <FaUserCheck />
              </div>
              <h3 className={styles.trustTitle}>Verified Users</h3>
              <p className={styles.trustText}>
                A marketplace that prioritizes credibility and trust.
              </p>
            </div>

            <div className={styles.trustCard}>
              <div className={styles.trustIcon}>
                <FaChartLine />
              </div>
              <h3 className={styles.trustTitle}>Transparent Bidding</h3>
              <p className={styles.trustText}>
                Clear bidding flow that keeps the experience honest and fair.
              </p>
            </div>
          </div>
        </section>

        <section className={`${styles.section} ${styles.deliverySection}`}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Delivery Pricing</h2>
            <p className={styles.sectionDesc}>
              Simple, clear delivery costs with no surprises.
            </p>
          </div>

          <div className={styles.deliveryGrid}>
            <div className={styles.deliveryCard}>
              <div className={styles.deliveryTop}>
                <span className={styles.deliveryTitle}>Beirut</span>
                <span className={styles.deliveryPrice}>$3</span>
              </div>
              <p className={styles.deliveryText}>
                Fast local delivery inside Beirut.
              </p>
            </div>

            <div className={styles.deliveryCard}>
              <div className={styles.deliveryTop}>
                <span className={styles.deliveryTitle}>Outside Beirut</span>
                <span className={styles.deliveryPrice}>$5</span>
              </div>
              <p className={styles.deliveryText}>
                Reliable delivery across other areas.
              </p>
            </div>
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>For Buyers & Sellers</h2>
            <p className={styles.sectionDesc}>
              Built for both sides with a clean workflow.
            </p>
          </div>

          <div className={styles.twoCol}>
            <div className={styles.colCard}>
              <h3 className={styles.colTitle}>For Buyers</h3>
              <ul className={styles.list}>
                <li>Browse items with clear details</li>
                <li>Bid and track updates in real time</li>
                <li>Win, checkout, and receive delivery</li>
              </ul>
            </div>

            <div className={styles.colCard}>
              <h3 className={styles.colTitle}>For Sellers</h3>
              <ul className={styles.list}>
                <li>List products with strong presentation</li>
                <li>Manage bids and update listings</li>
                <li>Sell through a clear and trusted flow</li>
              </ul>
            </div>
          </div>
        </section>

        <button
          className={`${styles.scrollTop} ${
            showTop ? styles.scrollTopVisible : ""
          }`}
          onClick={scrollToTop}
          aria-label="Scroll to top"
          type="button"
        >
          ↑
        </button>
      </div>
    </div>
  );
}
