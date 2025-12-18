"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuthContext } from "@/context/auth-context";
import styles from "./ProfileCreateStyle.module.css";

export default function ProfileCreateClient() {
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

  return (
    <div className={styles.mainContainer}>
      {/* Layer 0: Animated Gradient */}
      <div className={styles.bgGradient}></div>

      {/* Layer 1: Stars Canvas */}
      <canvas ref={canvasRef} className={styles.starsBg}></canvas>

      {/* Layer 2: Content */}
      <div className={styles.content}>
        <form onSubmit={handleSubmit} className={styles.formCard}>
          {/* Glow Effect */}
          <div className={styles.cardGlow}></div>

          {/* Header */}
          <div className={styles.header}>
            <span className={styles.badge}>
              <span className={styles.badgeIcon}>✨</span>
              Getting Started
            </span>
            <h1 className={styles.title}>Create Your Profile</h1>
            <p className={styles.subtitle}>
              Let's set up your account with some basic information
            </p>
          </div>

          {/* Messages */}
          {error && <div className={`${styles.message} ${styles.errorMessage}`}>{error}</div>}
          {success && <div className={`${styles.message} ${styles.successMessage}`}>{success}</div>}

          {/* Form Fields */}
          <div className={styles.formGroup}>
            <label htmlFor="firstName" className={styles.label}>
              First Name
            </label>
            <input
              id="firstName"
              name="firstName"
              type="text"
              placeholder="Enter your first name"
              value={form.firstName}
              onChange={handleChange}
              className={styles.input}
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
              placeholder="Enter your last name"
              value={form.lastName}
              onChange={handleChange}
              className={styles.input}
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
              placeholder="+961 or 03/70/71/76/78/79/81"
              value={form.phone}
              onChange={handleChange}
              className={styles.input}
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
              value={form.location}
              onChange={handleChange}
              className={styles.select}
              required
            >
              <option value="">Select your location</option>
              <option value="Beirut">Beirut</option>
              <option value="Outside Beirut">Outside Beirut</option>
            </select>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className={styles.submitButton}
          >
            {loading ? (
              <>
                <span className={styles.buttonIcon}>⏳</span>
                Creating Profile...
              </>
            ) : (
              <>
                <span className={styles.buttonIcon}>🚀</span>
                Create Profile
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}