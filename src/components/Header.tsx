// src/components/Header.tsx
"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import styles from "./Header.module.css";
import { FaBars, FaTimes, FaChevronDown } from "react-icons/fa";

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
        {/* Animated Logo */}
        <div className={styles.logoWrapper}>
          <div className={styles.logoContainer}>
            <div className={styles.logoBackground}>
              <div className={styles.logoShine} />
            </div>
            <Image
              src="/pics/logo.jpg"
              alt="Gainvestor Logo"
              width={160}
              height={45}
              priority
              className={styles.logoImage}
            />
            <div className={styles.logoBorder} />
          </div>
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
          <a
            href="#hero"
            className={styles.mobileNavLink}
            onClick={() => setMobileMenuOpen(false)}
          >
            Home
          </a>
          <a
            href="#mission"
            className={styles.mobileNavLink}
            onClick={() => setMobileMenuOpen(false)}
          >
            Mission
          </a>
          <a
            href="#value"
            className={styles.mobileNavLink}
            onClick={() => setMobileMenuOpen(false)}
          >
            Features
          </a>
          <a
            href="#team"
            className={styles.mobileNavLink}
            onClick={() => setMobileMenuOpen(false)}
          >
            Team
          </a>
          <a
            href="#vision"
            className={styles.mobileNavLink}
            onClick={() => setMobileMenuOpen(false)}
          >
            Vision
          </a>
          <div className={styles.mobileCta}>
            <button className={styles.loginButton}>Login</button>
            <button className={styles.signupButton}>Get Started</button>
          </div>
        </nav>
      </div>
    </header>
  );
}
