import React from "react";
import Image from "next/image";
import styles from "../TeamPage.module.css";

export default function TeamHero() {
  return (
    <header className={styles.hero}>
      <div className={styles.titleWrapper}>
        <Image
          src="/images/logos/logo2.png"
          alt="Logo Left"
          width={80}
          height={80}
          className={styles.flankingLogo}
        />

        <h1 className={styles.title}>
          Meet Our <span>Team</span>
        </h1>

        <Image
          src="/images/logos/logo2.png"
          alt="Logo Right"
          width={80}
          height={80}
          className={styles.flankingLogo}
        />
      </div>

      <p className={styles.subtitle}>
        The talented minds behind <span>BidZone</span> Platform.
      </p>
    </header>
  );
}
