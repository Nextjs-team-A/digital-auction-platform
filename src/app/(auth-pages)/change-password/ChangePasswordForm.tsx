"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { FiLock, FiArrowRight } from "react-icons/fi";
import AuthBackground from "@/components/AuthBackground";
import styles from "@/app/style/AuthStyles.module.css";
import premiumStyles from "@/app/profile/create/ProfileCreateStyle.module.css";

export default function ChangePasswordForm({
  unauthorized = false,
}: {
  unauthorized?: boolean;
}) {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [errors, setErrors] = useState<{
    oldPassword?: string;
    newPassword?: string;
    confirm?: string;
  }>({});

  const [serverError, setServerError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  // Enhanced Star Animation for Unauthorized UI
  useEffect(() => {
    if (!unauthorized) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const stars: Array<{
      x: number;
      y: number;
      radius: number;
      vx: number;
      vy: number;
      alpha: number;
      pulseSpeed: number;
      pulsePhase: number;
    }> = [];

    for (let i = 0; i < 180; i++) {
      stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: Math.random() * 2,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        alpha: Math.random() * 0.6 + 0.4,
        pulseSpeed: Math.random() * 0.02 + 0.01,
        pulsePhase: Math.random() * Math.PI * 2,
      });
    }

    let animationFrame = 0;

    function animate() {
      if (!ctx || !canvas) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      animationFrame++;

      stars.forEach((star) => {
        star.x += star.vx;
        star.y += star.vy;

        if (star.x < 0 || star.x > canvas.width) star.vx *= -1;
        if (star.y < 0 || star.y > canvas.height) star.vy *= -1;

        const pulse =
          Math.sin(animationFrame * star.pulseSpeed + star.pulsePhase) * 0.3 +
          0.7;
        const currentAlpha = star.alpha * pulse;

        const gradient = ctx.createRadialGradient(
          star.x,
          star.y,
          0,
          star.x,
          star.y,
          star.radius * 3
        );
        gradient.addColorStop(0, `rgba(16, 185, 129, ${currentAlpha * 0.8})`);
        gradient.addColorStop(0.5, `rgba(16, 185, 129, ${currentAlpha * 0.3})`);
        gradient.addColorStop(1, `rgba(16, 185, 129, 0)`);

        ctx.beginPath();
        ctx.arc(star.x, star.y, star.radius * 3, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(16, 185, 129, ${currentAlpha})`;
        ctx.fill();
      });

      requestAnimationFrame(animate);
    }

    animate();

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [unauthorized]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setServerError("");
    setSuccess("");

    const errs: typeof errors = {};
    if (!oldPassword) errs.oldPassword = "Required";
    if (!newPassword) errs.newPassword = "Required";
    if (!confirm) errs.confirm = "Required";
    if (newPassword && confirm && newPassword !== confirm)
      errs.confirm = "Passwords do not match";

    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }

    setErrors({});
    setLoading(true);

    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ oldPassword, newPassword }),
      });

      const data = await res.json();

      if (!res.ok) {
        setServerError(data.message || "Failed to change password");
        return;
      }

      setSuccess("Password updated successfully.");
      setOldPassword("");
      setNewPassword("");
      setConfirm("");
    } catch {
      setServerError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (unauthorized) {
    return (
      <div className={premiumStyles.page}>
        <div className={premiumStyles.bgGradient}></div>
        <canvas ref={canvasRef} className={premiumStyles.starsBg}></canvas>
        <div className={premiumStyles.content}>
          <div className={premiumStyles.unauthorizedCard}>
            <div className={premiumStyles.unauthorizedIcon}>
              <FiLock />
            </div>
            <h1 className={premiumStyles.unauthorizedTitle}>
              Unauthorized Access
            </h1>
            <p className={premiumStyles.unauthorizedSubtitle}>
              You must be logged in to change your password. Please sign in to
              continue.
            </p>
            <Link href="/login" className={premiumStyles.primaryButton}>
              <FiArrowRight className={premiumStyles.btnIcon} />
              Go to Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <AuthBackground>
      <div className={styles.card}>
        <h2 className={styles.title}>Change Password</h2>
        <p className={styles.subtitle}>Change your password.</p>

        {serverError && <div className={styles.errorText}>{serverError}</div>}

        {success && (
          <div style={{ color: "#059669", fontWeight: 700, marginBottom: 12 }}>
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          {/* OLD */}
          <div
            className={`${styles.field} ${
              errors.oldPassword ? styles.fieldError : ""
            }`}
          >
            <input
              type="password"
              placeholder=" "
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
            />
            <label>Current Password</label>
            {errors.oldPassword && (
              <div className={styles.errorText}>{errors.oldPassword}</div>
            )}
          </div>

          {/* NEW */}
          <div
            className={`${styles.field} ${
              errors.newPassword ? styles.fieldError : ""
            }`}
          >
            <input
              type="password"
              placeholder=" "
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
            <label>New Password</label>
            {errors.newPassword && (
              <div className={styles.errorText}>{errors.newPassword}</div>
            )}
          </div>

          {/* CONFIRM */}
          <div
            className={`${styles.field} ${
              errors.confirm ? styles.fieldError : ""
            }`}
          >
            <input
              type="password"
              placeholder=" "
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
            />
            <label>Confirm New Password</label>
            {errors.confirm && (
              <div className={styles.errorText}>{errors.confirm}</div>
            )}
          </div>

          <button className={styles.button} disabled={loading}>
            {loading ? "Updating..." : "Change Password"}
          </button>
        </form>
      </div>
    </AuthBackground>
  );
}
