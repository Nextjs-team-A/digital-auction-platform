// ============================================
// FILE 10: @/components/sections/DeliveryPricingSection.tsx
// ============================================

"use client";

import React from "react";
import { motion } from "framer-motion";
import styles from "./DeliveryPricingSection.module.css";

const deliveryOptions = [
  {
    title: "Beirut",
    price: "$3",
    text: "Fast local delivery inside Beirut.",
  },
  {
    title: "Outside Beirut",
    price: "$5",
    text: "Reliable delivery across other areas.",
  },
];

export default function DeliveryPricingSection() {
  return (
    <motion.section
      className={styles.section}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.8 }}
    >
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>Delivery Pricing</h2>
        <p className={styles.sectionDesc}>
          Simple, clear delivery costs with no surprises.
        </p>
      </div>

      <div className={styles.deliveryGrid}>
        {deliveryOptions.map((item, i) => (
          <motion.div
            key={item.title}
            className={styles.deliveryCard}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
          >
            <div className={styles.deliveryTop}>
              <span className={styles.deliveryTitle}>{item.title}</span>
              <span className={styles.deliveryPrice}>{item.price}</span>
            </div>
            <p className={styles.deliveryText}>{item.text}</p>
          </motion.div>
        ))}
      </div>
    </motion.section>
  );
}
