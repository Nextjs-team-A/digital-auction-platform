// ============================================
// FILE 14: @/components/sections/ScrollToTopButton.tsx
// ============================================

"use client";

import React, { useEffect, useState } from "react";
import styles from "./ScrolToTopButton.module.css";

export default function ScrollToTopButton() {
  const [showTop, setShowTop] = useState(false);

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 500);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  return (
    <button
      className={`${styles.scrollTop} ${
        showTop ? styles.scrollTopVisible : ""
      }`}
      onClick={scrollToTop}
      aria-label="Scroll to top"
      type="button"
    >
      ↑
    </button>
  );
}
