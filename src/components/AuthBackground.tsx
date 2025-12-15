"use client";

import { useEffect, useState } from "react";
import styles from "@/app/style/AuthStyles.module.css";

export default function AuthBackground({
  children,
}: {
  children: React.ReactNode;
}) {
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [click, setClick] = useState<{ x: number; y: number } | null>(null);

  useEffect(() => {
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
  }, []);

  return (
    <div className={styles.authPage}>
      <div className={styles.glow} style={{ left: pos.x, top: pos.y }} />

      {click && (
        <div
          className={styles.ripple}
          style={{ left: click.x, top: click.y }}
        />
      )}

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
