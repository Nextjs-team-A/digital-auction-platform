"use client";

import { useState, useEffect, useRef } from "react";
import { useAuthContext } from "@/context/auth-context";
import { useRouter } from "next/navigation";
import styles from "./ProfileEditStyle.module.css";

export default function ProfileEditClient() {
  const router = useRouter();
  const { user, loading, isAuthenticated } = useAuthContext();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    location: "Beirut",
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Load user profile data
  useEffect(() => {
    if (user?.profile) {
      setForm({
        firstName: user.profile.firstName || "",
        lastName: user.profile.lastName || "",
        phone: user.profile.phone || "",
        location: user.profile.location || "Beirut",
      });
    }
  }, [user]);

  // Stars animation effect
  useEffect(() => {
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
      opacity: number;
    }> = [];

    const numStars = 150;

    for (let i = 0; i < numStars; i++) {
      stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: Math.random() * 1.5 + 0.5,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        opacity: Math.random() * 0.5 + 0.3,
      });
    }

    function animate() {
      if (!ctx || !canvas) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      stars.forEach((star) => {
        star.x += star.vx;
        star.y += star.vy;

        if (star.x < 0 || star.x > canvas.width) star.vx = -star.vx;
        if (star.y < 0 || star.y > canvas.height) star.vy = -star.vy;

        ctx.beginPath();
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(5, 150, 105, ${star.opacity})`;
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

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch("/api/profile/update", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Update failed");
      }

      setSuccess("Profile updated successfully! ✔");
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.mainContainer}>
        <div className={styles.bgGradient}></div>
        <canvas ref={canvasRef} className={styles.starsBg}></canvas>
        <div className={styles.content}>
          <p style={{ textAlign: "center", color: "#059669" }}>Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className={styles.mainContainer}>
        <div className={styles.bgGradient}></div>
        <canvas ref={canvasRef} className={styles.starsBg}></canvas>
        <div className={styles.content}>
          <p style={{ textAlign: "center", color: "#059669" }}>
            Please log in to edit your profile.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.mainContainer}>
      {/* Layer 0: Animated Gradient */}
      <div className={styles.bgGradient}></div>

      {/* Layer 1: Stars Canvas */}
      <canvas ref={canvasRef} className={styles.starsBg}></canvas>

      {/* Layer 2: Content */}
      <div className={styles.content}>
        <form onSubmit={handleSave} className={styles.formCard}>
          {/* Glow Effect */}
          <div className={styles.cardGlow}></div>

          {/* Header */}
          <div className={styles.header}>
            <span className={styles.badge}>
              <span className={styles.badgeIcon}>✨</span>
              Account Settings
            </span>
            <h1 className={styles.title}>Edit Profile</h1>
            <p className={styles.subtitle}>
              Update your account details below
            </p>
          </div>

          {/* Messages */}
          {error && (
            <div className={`${styles.message} ${styles.errorMessage}`}>
              {error}
            </div>
          )}
          {success && (
            <div className={`${styles.message} ${styles.successMessage}`}>
              {success}
            </div>
          )}

          {/* Form Fields */}
          <div className={styles.formGroup}>
            <label htmlFor="firstName" className={styles.label}>
              First Name
            </label>
            <input
              id="firstName"
              name="firstName"
              type="text"
              className={styles.input}
              value={form.firstName}
              onChange={(e) =>
                setForm({ ...form, firstName: e.target.value })
              }
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="lastName" className={styles.label}>
              Last Name
            </label>
            <input
              id="lastName"
              name="lastName"
              type="text"
              className={styles.input}
              value={form.lastName}
              onChange={(e) => setForm({ ...form, lastName: e.target.value })}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="phone" className={styles.label}>
              Phone Number
            </label>
            <input
              id="phone"
              name="phone"
              type="tel"
              className={styles.input}
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="location" className={styles.label}>
              Location
            </label>
            <select
              id="location"
              name="location"
              className={styles.select}
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
              required
            >
              <option value="Beirut">Beirut</option>
              <option value="Outside Beirut">Outside Beirut</option>
            </select>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={saving}
            className={styles.submitButton}
          >
            {saving ? (
              <>
                <span className={styles.buttonIcon}>⏳</span>
                Saving...
              </>
            ) : (
              <>
                <span className={styles.buttonIcon}>💾</span>
                Save Changes
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}