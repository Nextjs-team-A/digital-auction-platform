import Image from "next/image";
import styles from "./Footer.module.css";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        {/* Logo */}
        <div className={styles.logoWrap}>
          <Image
            src="/images/logos/logo2.png"
            alt="BidZone"
            width={200}
            height={52}
            className={styles.logo}
          />
        </div>

        {/* Copyright */}
        <div className={styles.copy}>
          © {currentYear} BidZone. All rights reserved.
        </div>

        {/* Contact */}
        <div className={styles.contact}>
          <span className={styles.contactLabel}>Contact us:</span>
          <a
            href="mailto:contact.deska@gmail.com"
            className={styles.email}
          >
            contact.deska@gmail.com
          </a>
        </div>
      </div>
    </footer>
  );
}