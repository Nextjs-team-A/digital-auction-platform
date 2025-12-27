// ============================================
// FILE 6: @/components/sections/HowItWorksSection.tsx
// ============================================

"use client";

import React from "react";
import { motion } from "framer-motion";
import { FaSearch, FaGavel, FaCheckCircle, FaChartLine } from "react-icons/fa";
import styles from "./HowItWorksSection.module.css";

const steps = [
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
    icon: <FaChartLine />,
    title: "Platform fee (6%)",
    text: "A standard 6% platform fee applies only on successful auctions to support secure payments and fair bidding.",
  },
];

export default function HowItWorksSection() {
  return (
    <motion.section
      className={styles.section}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.8 }}
    >
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>How It Works</h2>
        <p className={styles.sectionDesc}>
          BidZone supports both bidding and direct purchases.
        </p>
      </div>

      <div className={styles.stepsGrid}>
        {steps.map((s, idx) => (
          <motion.div
            key={s.title}
            className={styles.stepCard}
            initial={{ opacity: 0, x: idx % 2 === 0 ? -20 : 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: idx * 0.1 }}
          >
            <div className={styles.stepLeft}>
              <div className={styles.stepNum}>{idx + 1}</div>
              <div className={styles.stepIcon}>{s.icon}</div>
            </div>
            <div>
              <h3 className={styles.stepTitle}>{s.title}</h3>
              <p className={styles.stepText}>{s.text}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.section>
  );
}
