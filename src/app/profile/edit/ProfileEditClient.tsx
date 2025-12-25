"use client";

import { useState, useEffect, useRef } from "react";
import { useAuthContext } from "@/context/auth-context";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  FiUser,
  FiPhone,
  FiMapPin,
  FiCheckCircle,
  FiAlertCircle,
  FiEdit3,
  FiArrowLeft,
  FiSave,
} from "react-icons/fi";
import styles from "./ProfileEditStyle.module.css";
import { useTheme } from "next-themes";

export default function ProfileEditClient() {
  const router = useRouter();
  const { user, loading, isAuthenticated, refreshSession } = useAuthContext();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    location: "",
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Theme awareness for canvas drawing
  const { resolvedTheme } = useTheme();
  const isDarkRef = useRef<boolean>(false);
  useEffect(() => {
    isDarkRef.current = resolvedTheme === "dark";
  }, [resolvedTheme]);

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

  // Enhanced Star Animation (theme-aware)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const DPR = Math.min(window.devicePixelRatio || 1, 2);
    const resizeCanvas = () => {
      canvas.width = Math.floor(window.innerWidth * DPR);
      canvas.height = Math.floor(window.innerHeight * DPR);
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    };

    resizeCanvas();

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

    const buildStars = () => {
      stars.length = 0;
      const count = Math.max(
        120,
        Math.floor((window.innerWidth * window.innerHeight) / 14000)
      );
      for (let i = 0; i < count; i++) {
        stars.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          radius: Math.random() * 2,
          vx: (Math.random() - 0.5) * 0.4,
          vy: (Math.random() - 0.5) * 0.4,
          alpha: Math.random() * 0.6 + 0.2,
          pulseSpeed: Math.random() * 0.02 + 0.01,
          pulsePhase: Math.random() * Math.PI * 2,
        });
      }
    };

    buildStars();

    let animationFrame = 0;
    let rafId = 0;

    function animate() {
      if (!ctx || !canvas) return;
      animationFrame++;

      // Fill with subtle overlay depending on theme so stars pop correctly
      if (isDarkRef.current) {
        ctx.fillStyle = "rgba(7, 8, 10, 0.18)";
      } else {
        ctx.fillStyle = "rgba(255, 255, 255, 0.06)";
      }
      ctx.fillRect(0, 0, canvas.width / DPR, canvas.height / DPR);

      stars.forEach((star) => {
        star.x += star.vx;
        star.y += star.vy;

        if (star.x < 0 || star.x > canvas.width / DPR) star.vx *= -1;
        if (star.y < 0 || star.y > canvas.height / DPR) star.vy *= -1;

        const pulse =
          Math.sin(animationFrame * star.pulseSpeed + star.pulsePhase) * 0.3 +
          0.7;
        const currentAlpha = star.alpha * pulse;

        // Theme-aware gradients and core color:
        if (isDarkRef.current) {
          // Dark: greener halos with brighter white-ish heads for contrast
          const gradient = ctx.createRadialGradient(
            star.x,
            star.y,
            0,
            star.x,
            star.y,
            star.radius * 4
          );
          gradient.addColorStop(0, `rgba(16, 185, 129, ${currentAlpha * 0.9})`);
          gradient.addColorStop(
            0.5,
            `rgba(16, 185, 129, ${currentAlpha * 0.35})`
          );
          gradient.addColorStop(1, `rgba(16, 185, 129, 0)`);
          ctx.beginPath();
          ctx.arc(star.x, star.y, star.radius * 4, 0, Math.PI * 2);
          ctx.fillStyle = gradient;
          ctx.fill();

          ctx.beginPath();
          ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(246,247,249, ${Math.min(
            1,
            currentAlpha + 0.15
          )})`;
          ctx.fill();
        } else {
          // Light: subtle green halos and dark-ish heads
          const gradient = ctx.createRadialGradient(
            star.x,
            star.y,
            0,
            star.x,
            star.y,
            star.radius * 4
          );
          gradient.addColorStop(0, `rgba(16, 185, 129, ${currentAlpha * 0.8})`);
          gradient.addColorStop(
            0.5,
            `rgba(16, 185, 129, ${currentAlpha * 0.3})`
          );
          gradient.addColorStop(1, `rgba(16, 185, 129, 0)`);
          ctx.beginPath();
          ctx.arc(star.x, star.y, star.radius * 4, 0, Math.PI * 2);
          ctx.fillStyle = gradient;
          ctx.fill();

          ctx.beginPath();
          ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(16,185,129, ${currentAlpha})`;
          ctx.fill();
        }
      });

      rafId = requestAnimationFrame(animate);
    }

    animate();

    const handleResize = () => {
      resizeCanvas();
      buildStars();
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      if (rafId) cancelAnimationFrame(rafId);
    };
    // Include resolvedTheme so canvas updates when theme changes
  }, [resolvedTheme]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
    setSuccess("");
  };

  const validate = () => {
    if (form.firstName.trim().length < 2)
      return "First name must be at least 2 characters";

    if (form.lastName.trim().length < 2)
      return "Last name must be at least 2 characters";

    const lebaneseRegex =
      /^(\+961\d{8}|03\d{6}|70\d{6}|71\d{6}|76\d{6}|78\d{6}|79\d{6}|81\d{6})$/;
    if (!lebaneseRegex.test(form.phone)) return "Invalid Lebanese phone number";

    if (!form.location) return "Location is required";

    return "";
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

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
      setSaving(false);

      if (!res.ok) {
        setError(data.message || "Failed to update profile");
        return;
      }

      setSuccess("Profile updated successfully");

      await refreshSession();

      setTimeout(() => {
        router.push("/profile");
      }, 1200);
    } catch {
      setSaving(false);
      setError("Something went wrong");
    }
  };

  if (loading) {
    return (
      <div className={styles.page}>
        <div className={styles.bgGradient}></div>
        <canvas ref={canvasRef} className={styles.starsBg}></canvas>
        <div className={styles.content}>
          <div className={styles.loadingCard}>
            <div className={styles.spinner}></div>
            <p className={styles.loadingText}>Loading your profile...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className={styles.page}>
        <div className={styles.bgGradient}></div>
        <canvas ref={canvasRef} className={styles.starsBg}></canvas>
        <div className={styles.content}>
          <div className={styles.unauthorizedCard}>
            <div className={styles.unauthorizedIcon}>
              <FiAlertCircle />
            </div>
            <h1 className={styles.unauthorizedTitle}>
              Authentication Required
            </h1>
            <p className={styles.unauthorizedSubtitle}>
              Please log in to edit your profile.
            </p>
            <Link href="/login" className={styles.primaryButton}>
              <FiArrowLeft className={styles.btnIcon} />
              Go to Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.bgGradient}></div>
      <canvas ref={canvasRef} className={styles.starsBg}></canvas>

      <div className={styles.content}>
        <div className={styles.formContainer}>
          {/* Hero Section */}
          <div className={styles.formHeader}>
            <div className={styles.badge}>
              <FiEdit3 className={styles.badgeIcon} />
              ACCOUNT SETTINGS
            </div>
            <h1 className={styles.title}>
              Edit Your <span className={styles.titleAccent}>Profile</span>
            </h1>
            <p className={styles.subtitle}>
              Update your account details and personal information below.
            </p>
          </div>

          {/* ✅ NEW: Account Actions (moved from Profile page) */}
          <div className={styles.formCard} style={{ marginBottom: "1.25rem" }}>
            <div className={styles.formWrapper}>
              <div
                className={styles.formGroup}
                style={{ marginBottom: "0.75rem" }}
              >
                <label className={styles.label}>Security & Account</label>
                <small className={styles.inputHint}>
                  Manage your login credentials and email from here.
                </small>
              </div>

              <div style={{ display: "flex", gap: "0.9rem", flexWrap: "wrap" }}>
                <button
                  type="button"
                  className={styles.primaryButton}
                  onClick={() => router.push("/change-email")}
                >
                  Change Email
                </button>

                <button
                  type="button"
                  className={styles.primaryButton}
                  onClick={() => router.push("/change-password")}
                >
                  Change Password
                </button>
              </div>
            </div>
          </div>

          {/* Form Card */}
          <div className={styles.formCard}>
            <div className={styles.formWrapper}>
              {/* Alert Messages */}
              {error && (
                <div className={styles.alertError}>
                  <FiAlertCircle className={styles.alertIcon} />
                  <span>{error}</span>
                </div>
              )}

              {success && (
                <div className={styles.alertSuccess}>
                  <FiCheckCircle className={styles.alertIcon} />
                  <span>{success}</span>
                </div>
              )}

              {/* First Name */}
              <div className={styles.formGroup}>
                <label className={styles.label}>
                  <FiUser className={styles.labelIcon} />
                  First Name
                </label>
                <div className={styles.inputWrapper}>
                  <input
                    type="text"
                    name="firstName"
                    placeholder="Enter your first name"
                    value={form.firstName}
                    onChange={handleChange}
                    className={styles.input}
                  />
                </div>
              </div>

              {/* Last Name */}
              <div className={styles.formGroup}>
                <label className={styles.label}>
                  <FiUser className={styles.labelIcon} />
                  Last Name
                </label>
                <div className={styles.inputWrapper}>
                  <input
                    type="text"
                    name="lastName"
                    placeholder="Enter your last name"
                    value={form.lastName}
                    onChange={handleChange}
                    className={styles.input}
                  />
                </div>
              </div>

              {/* Phone */}
              <div className={styles.formGroup}>
                <label className={styles.label}>
                  <FiPhone className={styles.labelIcon} />
                  Phone Number
                </label>
                <div className={styles.inputWrapper}>
                  <input
                    type="tel"
                    name="phone"
                    placeholder="Enter your phone number"
                    value={form.phone}
                    onChange={handleChange}
                    className={styles.input}
                  />
                </div>
              </div>

              {/* Location */}
              <div className={styles.formGroup}>
                <label className={styles.label}>
                  <FiMapPin className={styles.labelIcon} />
                  Location
                </label>
                <div className={styles.inputWrapper}>
                  <select
                    name="location"
                    value={form.location}
                    onChange={handleChange}
                    className={styles.select}
                  >
                    <option value="">Select your location</option>
                    <option value="Beirut">Beirut</option>
                    <option value="Outside Beirut">Outside Beirut</option>
                  </select>
                  <FiMapPin className={styles.selectIcon} />
                </div>
              </div>

              {/* Submit Button */}
              <button
                onClick={handleSave}
                disabled={saving}
                className={styles.submitButton}
              >
                {saving ? (
                  <>
                    <div className={styles.spinner}></div>
                    Saving Changes...
                  </>
                ) : (
                  <>
                    <FiSave className={styles.btnIcon} />
                    Save Changes
                  </>
                )}
              </button>
            </div>

            {/* Footer */}
            <div className={styles.formFooter}>
              <p className={styles.footerText}>
                Want to view your profile?{" "}
                <Link href="/profile" className={styles.footerLink}>
                  Go to Profile
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}