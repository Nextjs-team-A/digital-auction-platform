"use client";

import styles from "@/app/style/AuthStyles.module.css";

type Props = {
    title: string;
    subtitle?: string;
    showLogo?: boolean;
    children: React.ReactNode;
};

export default function AuthLayout({
    title,
    subtitle,
    showLogo = false,
    children,
}: Props) {
    return (
        <div className={styles.card}>
            {showLogo && (
                <div className={styles.logo}>
                    <img src="/logo-auction.png" alt="BidZone Logo" />
                </div>
            )}

            <h1 className={styles.title}>{title}</h1>

            {subtitle && (
                <p className={styles.subtitle}>{subtitle}</p>
            )}

            {children}
        </div>
    );
}
