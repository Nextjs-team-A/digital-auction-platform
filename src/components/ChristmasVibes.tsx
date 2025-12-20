"use client";

import React from "react";
import Snowfall from "react-snowfall";
import { FaTree, FaStar } from "react-icons/fa";
import styles from "./ChristmasVibes.module.css";

/**
 * Global background snow effect with enhanced visibility.
 */
export const ChristmasSnow = () => {
  return (
    <div className={styles.snowContainer}>
      <Snowfall
        color="#ffffff"
        snowflakeCount={120}
        radius={[1.0, 5.0]} // Increased size for better visibility
        speed={[0.5, 3.0]}
        wind={[-0.5, 2.0]}
      />
    </div>
  );
};

/**
 * Professional Christmas banner with React Icons.
 */
export const ChristmasBanner = () => {
  return (
    <div className={styles.bannerWrapper}>
      <div className={styles.iconsRow}>
        <div className={styles.iconItem}>
          <FaTree />
        </div>
        <div className={`${styles.iconItem} ${styles.sparkle}`}>
          <FaStar />
        </div>
        <div className={styles.iconItem}>
          <FaTree />
        </div>
      </div>

      <div className={styles.festiveBanner}>
        Merry Christmas & Happy New Year From BidZone ❄️
      </div>
    </div>
  );
};

// Default export if needed, or we just import named members
const ChristmasVibes = () => {
  return (
    <>
      <ChristmasSnow />
      <ChristmasBanner />
    </>
  );
};

export default ChristmasVibes;
