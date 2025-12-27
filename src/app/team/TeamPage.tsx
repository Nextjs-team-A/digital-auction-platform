"use client";

import React, { useEffect, useState } from "react";
import { teamMembers } from "@/utils/data";
import styles from "./TeamPage.module.css";
import BackgroundCanvas from "@/components/LandingPageSections/BackgroundCanvas";
import TeamHero from "./components/TeamHero";
import TeamMemberCard from "./components/TeamMemberCard";

const TeamPage: React.FC = () => {
  // Scroll reveal state: stores card indexes + idx+1000 for "expanded"
  const [visible, setVisible] = useState<number[]>([]);

  // Scroll reveal logic
  useEffect(() => {
    const handleScroll = () => {
      const cards = document.querySelectorAll(`.${styles.card}`);
      const newVisible: number[] = [];
      cards.forEach((card, idx) => {
        const rect = card.getBoundingClientRect();
        if (rect.top < window.innerHeight * 0.85) newVisible.push(idx);
      });
      setVisible(newVisible);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleToggleExpand = (idx: number) => {
    const expandedKey = idx + 1000;
    if (visible.includes(expandedKey)) {
      setVisible(visible.filter((i) => i !== expandedKey));
    } else {
      setVisible([...visible, expandedKey]);
    }
  };

  return (
    <div className={styles.container}>
      {/* Background Gradient */}
      <div className={styles.bgGradient} aria-hidden="true" />

      {/* Animated Star Background - Reused from home page! */}
      <BackgroundCanvas />

      {/* Hero Section */}
      <TeamHero />

      {/* Team Grid */}
      <div className={styles.grid}>
        {teamMembers.map((member, idx) => {
          const isVisible = visible.includes(idx);
          const isExpanded = visible.includes(idx + 1000);

          return (
            <TeamMemberCard
              key={idx}
              member={member}
              isVisible={isVisible}
              isExpanded={isExpanded}
              onToggleExpand={() => handleToggleExpand(idx)}
            />
          );
        })}
      </div>
    </div>
  );
};

export default TeamPage;
