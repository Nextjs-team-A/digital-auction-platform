// src/components/Header.tsx
"use client";
import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import styles from "./Header.module.css";
import { FaBars, FaTimes } from "react-icons/fa";
import LogoutButton from "./LogoutButton";

// --- STAR ANIMATION LOGIC (Adapted from page.tsx) ---
const animationState = {
  w: 0,
  h: 0,
  dpr: 1,
  reducedMotion: false,
};

class Star {
  c: CanvasRenderingContext2D;
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
    this.a = (layer === 0 ? 0.12 : layer === 1 ? 0.16 : 0.22) + Math.random() * 0.12;
  }

  step() {
    if (animationState.reducedMotion) return;
    this.x += this.vx;
    this.y += this.vy;

    if (this.x < -30) this.x = animationState.w + 30;
    if (this.x > animationState.w + 30) this.x = -30;
    if (this.y < -30) this.y = animationState.h + 30;
    if (this.y > animationState.h + 30) this.y = -30;
  }

  draw() {
    this.c.save();
    this.c.globalAlpha = this.a;
    this.c.fillStyle = "rgba(15, 23, 42, 0.90)"; // Dark stars
    this.c.beginPath();
    this.c.arc(this.x, this.y, this.r, 0, Math.PI * 2);
    this.c.fill();
    this.c.restore();
  }
}

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const headerRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // --- CANVAS EFFECT ---
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !headerRef.current) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    animationState.dpr = Math.min(window.devicePixelRatio || 1, 2);
    animationState.reducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false;

    const resize = () => {
      if (!headerRef.current) return false;
      const rect = headerRef.current.getBoundingClientRect();
      animationState.w = rect.width;
      animationState.h = rect.height;

      if (!animationState.w || !animationState.h) return false;

      canvas.width = Math.floor(animationState.w * animationState.dpr);
      canvas.height = Math.floor(animationState.h * animationState.dpr);
      ctx.setTransform(animationState.dpr, 0, 0, animationState.dpr, 0, 0);
      return true;
    };

    const stars: Star[] = [];
    const buildStars = () => {
      stars.length = 0;
      // Fewer stars for header area
      const count = Math.floor(animationState.w / 60);
      for (let i = 0; i < count; i++) {
        stars.push(new Star(ctx, i % 3));
      }
    };

    let raf = 0;
    const loop = () => {
      ctx.clearRect(0, 0, animationState.w, animationState.h);
      for (const s of stars) {
        s.step();
        s.draw();
      }
      raf = requestAnimationFrame(loop);
    };

    const onResize = () => {
      if (resize()) buildStars();
    };

    window.addEventListener("resize", onResize);

    // Init
    if (resize()) {
      buildStars();
      loop();
    }

    return () => {
      window.removeEventListener("resize", onResize);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <header ref={headerRef} className={`${styles.header} ${scrolled ? styles.scrolled : ""}`}>
      {/* Background Canvas */}
      <canvas ref={canvasRef} className={styles.headerCanvas} aria-hidden="true" />

      <div className={styles.headerContainer}>

        <div className={styles.logoContainer}>
          <Image
            src="/images/logos/logoo1.png"
            alt="logo of the website"
            width={1000}
            height={100}
            className={styles.logo}
          />

        </div>
        {/* Desktop Navigation */}
        <nav className={styles.desktopNav}>
          <Link href="/" className={styles.navLink}>
            Home
          </Link>
          <Link href="/contact" className={styles.navLink}>
            Contact
          </Link>
          <Link href="/team" className={styles.navLink}>
            Team
          </Link>
          <Link href="/about" className={styles.navLink}>
            About
          </Link>
        </nav>

        <div >
          {/* dark mode theme */}
        </div>

        {/* Mobile Menu Toggle */}
        
        <button
          className={styles.mobileMenuToggle}
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <FaTimes /> : <FaBars />}
        </button>
      </div>

      {/* Mobile Menu */}
      <div
        className={`${styles.mobileMenu} ${mobileMenuOpen ? styles.mobileMenuOpen : ""
          }`}
      >
        <nav className={styles.mobileNav}>
          <Link
            href="/"
            className={styles.mobileNavLink}
            onClick={() => setMobileMenuOpen(false)}
          >
            Home
          </Link>
          <Link
            href="/contact"
            className={styles.mobileNavLink}
            onClick={() => setMobileMenuOpen(false)}
          >
            Contact
          </Link>
          <Link
            href="/team"
            className={styles.mobileNavLink}
            onClick={() => setMobileMenuOpen(false)}
          >
            Team
          </Link>
          <Link
            href="/about"
            className={styles.mobileNavLink}
            onClick={() => setMobileMenuOpen(false)}
          >
            About
          </Link>

        </nav>
      </div>
    </header>
  );
}
