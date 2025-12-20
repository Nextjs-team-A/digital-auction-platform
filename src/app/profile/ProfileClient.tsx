"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthContext } from "@/context/auth-context";
import LogoutButton from "@/components/LogoutButton";
import Link from "next/link";

// ✅ IMPORTANT: this path MUST match your real file name EXACTLY
// If your file is "profileclient.module.css", keep this lowercase:
import styles from "./ProfileClient.module.css";

/** Mirrors AboutPage star animation structure (layers + pointer pull + shooters + connections) */
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
    this.c.fillStyle = "rgba(16, 185, 129, 0.92)";
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
    this.c.fillStyle = "rgba(16,185,129,1)";
    this.c.beginPath();
    this.c.arc(this.x, this.y, 1.7, 0, Math.PI * 2);
    this.c.fill();

    this.c.restore();
  }
}

export default function ProfileClient() {
  const router = useRouter();
  const { user, loading, isAuthenticated } = useAuthContext();

  const [mounted, setMounted] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

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

  if (!mounted) return null;

  if (loading) {
    return (
      <main className={styles.mainContainer}>
        <div className={styles.bgGradient} aria-hidden="true" />
        <canvas ref={canvasRef} className={styles.starsBg} aria-hidden="true" />
        <div className={styles.content}>
          <section className={styles.sectionContainer}>
            <div className={styles.contentContainer}>
              <div className={styles.heroSection}>
                <div className={styles.heroContent}>
                  <div className={styles.heroBadge}>PROFILE</div>
                  <h1 className={styles.heroTitle}>
                    Loading <span className={styles.gradientText}>Profile</span>
                  </h1>
                  <p className={styles.heroSubtitle}>
                    Please wait while we fetch your account details.
                  </p>
                </div>
                <div className={styles.profileCard}>
                  <div className={styles.skeletonRow} />
                  <div className={styles.skeletonRow} />
                  <div className={styles.skeletonRow} />
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <main className={styles.mainContainer}>
        <div className={styles.bgGradient} aria-hidden="true" />
        <canvas ref={canvasRef} className={styles.starsBg} aria-hidden="true" />
        <div className={styles.content}>
          <section className={styles.sectionContainer}>
            <div className={styles.contentContainer}>
              <div className={styles.heroSection}>
                <div className={styles.heroContent}>
                  <div className={styles.heroBadge}>PROFILE</div>
                  <h1 className={styles.heroTitle}>
                    Access <span className={styles.gradientText}>Required</span>
                  </h1>
                  <p className={styles.heroSubtitle}>
                    Please log in to view your profile information.
                  </p>
                </div>
                <div className={styles.profileCard}>
                  <p className={styles.noticeText}>
                    You are not signed in or your session expired.
                  </p>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
    );
  }

  const firstName = user.profile?.firstName || "—";
  const lastName = user.profile?.lastName || "";
  const phone = user.profile?.phone || "Not set";
  const location = user.profile?.location || "Not set";

  return (
    <main className={styles.mainContainer}>
      <div className={styles.bgGradient} aria-hidden="true" />
      <canvas ref={canvasRef} className={styles.starsBg} aria-hidden="true" />

      <div className={styles.content}>
        <section className={`${styles.sectionContainer} ${styles.heroSection}`}>
          <div className={styles.contentContainer}>
            <div className={styles.heroContent}>
              <div className={styles.heroBadge}>PROFILE</div>

              <h1 className={styles.heroTitle}>
                {firstName}{" "}
                <span className={styles.gradientText}>{lastName}</span>
              </h1>

              <p className={styles.heroSubtitle}>
                Manage your account details and quick actions in the same
                platform style.
              </p>

              <div className={styles.profileCard}>
                <div className={styles.profileGrid}>
                  <div className={styles.profileField}>
                    <div className={styles.fieldLabel}>Email</div>
                    <div className={styles.fieldValue}>{user.email}</div>
                  </div>

                  <div className={styles.profileField}>
                    <div className={styles.fieldLabel}>Phone</div>
                    <div className={styles.fieldValue}>{phone}</div>
                  </div>

                  <div className={styles.profileField}>
                    <div className={styles.fieldLabel}>Location</div>
                    <div className={styles.fieldValue}>{location}</div>
                  </div>
                </div>

                {/* ✅ FINAL ACTIONS: ONLY 3 */}
                <div className={styles.actionsRow}>
                  <button
                    className={styles.primaryButton}
                    onClick={() => router.push("/profile/edit")}
                    type="button"
                  >
                    Edit Profile
                  </button>

                  <button
                    className={styles.secondaryButton}
                    onClick={() => router.push("/products/my-products")}
                    type="button"
                  >
                    My Products
                  </button>

                  <div className={styles.logoutWrap}>
                    <LogoutButton />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
