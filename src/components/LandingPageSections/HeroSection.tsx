// ============================================
// FILE 2: @/components/sections/HeroSection.tsx
// ============================================

"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import styles from "./HeroSection.module.css";

export default function HeroSection() {
  const { isAuthenticated } = useAuth();

  return (
    <motion.section
      className={styles.hero}
      suppressHydrationWarning
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
    >
      <div className={styles.heroInner}>
        <div className={styles.badge}>BidZone • Digital Auction Platform</div>

        <h1 className={styles.title}>
          Premium auctions, <span>built for trust and speed</span>
        </h1>

        <p className={styles.subtitle}>
          A smarter way to buy and sell, with security you can trust.
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
      </div>
    </motion.section>
  );
}
