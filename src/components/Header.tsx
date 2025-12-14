// src/components/Header.tsx
import React from 'react';
import Image from 'next/image'; // We need Image here for the logo!
import styles from './Header.module.css'; // This path is correct for a sibling CSS file

export default function Header() {
    return (
        <header className={styles.header}>
            <div className={styles.logoContainer}>
                {/* LOGO IMPLEMENTATION */}
                <Image
                    src="/pics/logo.jpg" // ASSUMED PATH. ADJUST IF NECESSARY.
                    alt="Gainvestor Logo"
                    width={150}
                    height={40}
                    priority
                />
            </div>
            {/* Placeholder for future Navigation Links */}
            <nav className={styles.navLinks}>
                {/* If you have links, they go here */}
            </nav>
        </header>
    );
}