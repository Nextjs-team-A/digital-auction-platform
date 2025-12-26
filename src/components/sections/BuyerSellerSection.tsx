// ============================================
// FILE 12: @/components/sections/BuyerSellerSection.tsx
// ============================================

"use client";

import React from "react";
import { motion } from "framer-motion";
import styles from "./BuyerSellerSection.module.css";

export default function BuyerSellerSection() {
  return (
    <motion.section
      className={styles.section}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.8 }}
    >
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>For Buyers & Sellers</h2>
        <p className={styles.sectionDesc}>
          Built for both sides with a clean workflow.
        </p>
      </div>

      <div className={styles.twoCol}>
        <motion.div
          className={styles.colCard}
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h3 className={styles.colTitle}>For Buyers</h3>
          <ul className={styles.list}>
            <li>Browse items with clear details</li>
            <li>Bid and track updates in real time</li>
            <li>Win, checkout, and receive delivery</li>
          </ul>
        </motion.div>

        <motion.div
          className={styles.colCard}
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h3 className={styles.colTitle}>For Sellers</h3>
          <ul className={styles.list}>
            <li>List products with strong presentation</li>
            <li>Manage bids and update listings</li>
            <li>Sell through a clear and trusted flow</li>
          </ul>
        </motion.div>
      </div>
    </motion.section>
  );
}
