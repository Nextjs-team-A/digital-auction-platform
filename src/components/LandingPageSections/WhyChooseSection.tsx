// ============================================
// FILE 4: @/components/sections/WhyChooseSection.tsx
// ============================================

"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  FaBolt,
  FaRegListAlt,
  FaLeaf,
  FaUsers,
  FaTruck,
  FaHeadset,
} from "react-icons/fa";
import styles from "./WhyChooseSection.module.css";

const features = [
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
];

export default function WhyChooseSection() {
  return (
    <motion.section
      className={styles.section}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.8 }}
    >
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>Why Choose BidZone</h2>
        <p className={styles.sectionDesc}>
          A premium experience built for clarity, speed, and trust.
        </p>
      </div>

      <div className={styles.cards6}>
        {features.map((f, i) => (
          <motion.div
            key={f.title}
            className={styles.card}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
          >
            <div className={styles.cardIcon}>{f.icon}</div>
            <h3 className={styles.cardTitle}>{f.title}</h3>
            <p className={styles.cardText}>{f.text}</p>
          </motion.div>
        ))}
      </div>
    </motion.section>
  );
}
