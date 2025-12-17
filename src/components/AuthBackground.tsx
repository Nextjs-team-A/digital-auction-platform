"use client";

import { useEffect, useRef, useState } from "react";
import pageStyles from "@/app/page.module.css";
import authStyles from "@/app/style/AuthStyles.module.css";

export default function AuthBackground({
  children,
}: {
  children: React.ReactNode;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let w = window.innerWidth;
    let h = window.innerHeight;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const resize = () => {
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resize();
    window.addEventListener("resize", resize);

    const stars = Array.from({ length: 140 }).map(() => ({
      x: Math.random() * w,
      y: Math.random() * h,
      r: Math.random() * 1.4 + 0.6,
      vx: (Math.random() - 0.5) * 0.15,
      vy: (Math.random() - 0.5) * 0.15,
    }));

    let raf = 0;
    const loop = () => {
      ctx.clearRect(0, 0, w, h);

      for (const s of stars) {
        s.x += s.vx;
        s.y += s.vy;

        if (s.x < 0) s.x = w;
        if (s.x > w) s.x = 0;
        if (s.y < 0) s.y = h;
        if (s.y > h) s.y = 0;

        ctx.globalAlpha = 0.7;
        ctx.fillStyle = "rgba(15,23,42,0.9)";
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fill();
      }

      raf = requestAnimationFrame(loop);
    };

    loop();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, [mounted]);

  return (
    <div className={pageStyles.page}>
      {/* Layer 0 */}
      <div className={pageStyles.bgGradient} />

      {/* Layer 1 */}
      {mounted && (
        <canvas ref={canvasRef} className={pageStyles.starsBg} />
      )}

      {/* ✅ Layer 2 — CENTERED AUTH CONTENT */}
      <div className={authStyles.centerWrapper}>
        {children}
      </div>
    </div>
  );
}
