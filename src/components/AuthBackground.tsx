"use client";

import { useEffect, useState } from "react";
import styles from "@/app/style/AuthStyles.module.css";

export default function AuthBackground({
    children,
}: {
    children: React.ReactNode;
}) {
    const [mounted, setMounted] = useState(false);
    const [pos, setPos] = useState({ x: 0, y: 0 });
    const [click, setClick] = useState<{ x: number; y: number } | null>(null);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (!mounted) return;

        const onMove = (e: MouseEvent) => {
            setPos({ x: e.clientX, y: e.clientY });
        };

        const onClick = (e: MouseEvent) => {
            setClick({ x: e.clientX, y: e.clientY });
            setTimeout(() => setClick(null), 200);
        };

        window.addEventListener("mousemove", onMove);
        window.addEventListener("mousedown", onClick);

        return () => {
            window.removeEventListener("mousemove", onMove);
            window.removeEventListener("mousedown", onClick);
        };
    }, [mounted]);

    if (!mounted) {
        return (
            <div className={styles.authPage}>
                {children}
            </div>
        );
    }

    return (
        <div className={styles.authPage}>
            {/* Hover glow */}
            <div
                className={styles.glow}
                style={{
                    left: pos.x,
                    top: pos.y,
                }}
            />

            {/* Click ripple */}
            {click && (
                <div
                    className={styles.ripple}
                    style={{
                        left: click.x,
                        top: click.y,
                    }}
                />
            )}

            {/* CENTERED CONTENT */}
            <div
                style={{
                    position: "relative",
                    zIndex: 2,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: "100%",
                }}
            >
                {children}
            </div>
        </div>
    );
}
