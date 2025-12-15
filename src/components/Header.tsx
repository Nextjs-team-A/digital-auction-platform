// src/components/Header.tsx
"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import styles from "./Header.module.css";
import { FaBars, FaTimes } from "react-icons/fa";

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header className={`${styles.header} ${scrolled ? styles.scrolled : ""}`}>
      <div className={styles.headerContainer}>
        {/* Animated Logo with Text */}
        <div className={styles.logoWrapper}>
          <Link href="/" className={styles.logoContainer}>
            <div className={styles.logoBackground}>
              <div className={styles.logoShine} />
            </div>

            {/* Logo Image and Text Combined */}
            <div className={styles.logoContent}>
              <Image
                src="/images/logos/logo2.png"
                alt="BidZone Logo"
                width={50}
                height={50}
                priority
                className={styles.logoImage}
              />
              <div className={styles.logoText}>
                <h1 className={styles.brandName}>BidZone</h1>
                <p className={styles.brandTagline}>Digital Auction Platform</p>
              </div>
            </div>

            <div className={styles.logoBorder} />
          </Link>
          <div className={styles.logoGlow} />
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

        {/* CTA Buttons */}
        <div className={styles.ctaButtons}>
          <Link href="/login" className={styles.loginButton}>
            Login
          </Link>
          <Link href="/register" className={styles.signupButton}>
            Get Started
          </Link>
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
        className={`${styles.mobileMenu} ${
          mobileMenuOpen ? styles.mobileMenuOpen : ""
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
          <div className={styles.mobileCta}>
            <Link href="/login" className={styles.loginButton}>
              Login
            </Link>
            <Link href="/register" className={styles.signupButton}>
              Get Started
            </Link>
          </div>
        </nav>
      </div>
    </header>
  );
}
