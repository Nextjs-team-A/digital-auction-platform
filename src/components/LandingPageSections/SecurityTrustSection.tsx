// ============================================
// FILE 8: @/components/sections/SecurityTrustSection.tsx
// ============================================

"use client";

import React from "react";
import { motion } from "framer-motion";
import { FaLock, FaUserCheck, FaChartLine } from "react-icons/fa";
import styles from "./SecurityTrustSection.module.css";

const trustItems = [
  {
    icon: <FaLock />,
    title: "Secure Payments",
    text: "Smooth checkout experience with a security-first mindset.",
  },
  {
    icon: <FaUserCheck />,
    title: "Verified Users",
    text: "A marketplace that prioritizes credibility and trust.",
  },
  {
    icon: <FaChartLine />,
    title: "Transparent Bidding",
    text: "Clear bidding flow that keeps the experience honest and fair.",
  },
];

export default function SecurityTrustSection() {
  return (
    <motion.section
      className={styles.section}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.8 }}
    >
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>Security & Trust</h2>
        <p className={styles.sectionDesc}>
          Designed to feel safe, professional, and transparent.
        </p>
      </div>

      <div className={styles.cards3}>
        {trustItems.map((trust, i) => (
          <motion.div
            key={trust.title}
            className={styles.trustCard}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
          >
            <div className={styles.trustIcon}>{trust.icon}</div>
            <h3 className={styles.trustTitle}>{trust.title}</h3>
            <p className={styles.trustText}>{trust.text}</p>
          </motion.div>
        ))}
      </div>
    </motion.section>
  );
}
