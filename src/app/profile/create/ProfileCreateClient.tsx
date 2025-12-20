"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuthContext } from "@/context/auth-context";
import {
  FiUser,
  FiPhone,
  FiMapPin,
  FiCheckCircle,
  FiAlertCircle,
  FiArrowRight,
  FiEdit3,
  FiLock,
} from "react-icons/fi";
import styles from "./ProfileCreateStyle.module.css";

export default function ProfileCreateClient({
  unauthorized = false,
}: {
  unauthorized?: boolean;
}) {
  const router = useRouter();
  const { refreshSession } = useAuthContext();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    location: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Enhanced Star Animation
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
  }, []);

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
    if (!lebaneseRegex.test(form.phone)) return "Invalid Lebanese Phone Number";

    if (!form.location) return "Location is required";

    return "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch("/api/profile/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(form),
      });

      const data = await res.json();
      setLoading(false);

      if (!res.ok) {
        setError(data.message || "Failed to create profile");
        return;
      }

      setSuccess("Profile created successfully");

      await refreshSession();

      setTimeout(() => {
        router.push("/profile");
      }, 800);
    } catch {
      setLoading(false);
      setError("Something went wrong");
    }
  };

  if (unauthorized) {
    return (
      <div className={styles.page}>
        <div className={styles.bgGradient}></div>
        <canvas ref={canvasRef} className={styles.starsBg}></canvas>
        <div className={styles.content}>
          <div className={styles.unauthorizedCard}>
            <div className={styles.unauthorizedIcon}>
              <FiLock />
            </div>
            <h1 className={styles.unauthorizedTitle}>Unauthorized Access</h1>
            <p className={styles.unauthorizedSubtitle}>
              You must be logged in to create a profile. Please sign in to
              continue.
            </p>
            <Link href="/login" className={styles.primaryButton}>
              <FiArrowRight className={styles.btnIcon} />
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
              SETUP YOUR PROFILE
            </div>
            <h1 className={styles.title}>
              Create Your <span className={styles.titleAccent}>Profile</span>
            </h1>
            <p className={styles.subtitle}>
              Complete your profile to start bidding on amazing products and
              creating your own auctions.
            </p>
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
                onClick={handleSubmit}
                disabled={loading}
                className={styles.submitButton}
              >
                {loading ? (
                  <>
                    <div className={styles.spinner}></div>
                    Creating Profile...
                  </>
                ) : (
                  <>
                    <FiCheckCircle className={styles.btnIcon} />
                    Create Profile
                  </>
                )}
              </button>
            </div>

            {/* Footer */}
            <div className={styles.formFooter}>
              <p className={styles.footerText}>
                Already have a profile?{" "}
                <Link href="/profile" className={styles.footerLink}>
                  View Profile
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
