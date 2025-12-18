"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { useAuthContext } from "@/context/auth-context";
import { useRouter } from "next/navigation";
import styles from "./ProfileEditStyle.module.css";

export default function ProfileEditClient({
  unauthorized = false,
}: {
  unauthorized?: boolean;
}) {
  const router = useRouter();
  const { user, loading, isAuthenticated } = useAuthContext();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // ⛔ NO useEffect for setForm!
  // ⛔ NO syncing inside effect!
  // ✅ Initialize once from user safely
  const [form, setForm] = useState(() => ({
    firstName: user?.profile?.firstName || "",
    lastName: user?.profile?.lastName || "",
    phone: user?.profile?.phone || "",
    location: user?.profile?.location || "Beirut",
  }));

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

  // Star Animation
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
    if (!form.firstName || form.firstName.length < 2)
      return "First name must be at least 2 letters.";
    if (!form.lastName || form.lastName.length < 2)
      return "Last name must be at least 2 letters.";
    if (!form.phone || form.phone.length < 8) return "Invalid phone number.";
    if (!form.location) return "Location is required.";
    return "";
  };

  const handleSave = async () => {
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

      setSuccess("Profile updated successfully ✔");
    } catch (err) {
      setSaving(false);
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
            <h1 className={styles.unauthorizedTitle}>Unauthorized</h1>
            <p className={styles.unauthorizedSubtitle}>
              You must be logged in to edit your profile.
            </p>
            <Link href="/login" className={styles.primaryButton}>
              Go to Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (loading) return <p>Loading...</p>;
  if (!isAuthenticated || !user)
    return <p>You must be logged in to edit your profile.</p>;

  return (
    <div style={inlineStyles.container}>
      <div style={inlineStyles.card}>
        <h2 style={inlineStyles.title}>Edit Profile</h2>

        {error && <p style={inlineStyles.error}>{error}</p>}
        {success && <p style={inlineStyles.success}>{success}</p>}

        <input
          name="firstName"
          placeholder="First Name"
          value={form.firstName}
          onChange={handleChange}
          style={inlineStyles.input}
        />

        <input
          name="lastName"
          placeholder="Last Name"
          value={form.lastName}
          onChange={handleChange}
          style={inlineStyles.input}
        />

        <input
          name="phone"
          placeholder="Phone"
          value={form.phone}
          onChange={handleChange}
          style={inlineStyles.input}
        />

        <select
          name="location"
          value={form.location}
          onChange={handleChange}
          style={inlineStyles.input}
        >
          <option value="">Select Location</option>
          <option value="Beirut">Beirut</option>
          <option value="Outside Beirut">Outside Beirut</option>
        </select>

        <button
          onClick={handleSave}
          disabled={saving}
          style={inlineStyles.button}
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </div>
  );
}

const inlineStyles = {
  container: {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "#f5f7fa",
  },
  card: {
    width: "100%",
    maxWidth: "400px",
    background: "#fff",
    padding: "30px",
    borderRadius: "10px",
    boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
  },
  title: {
    textAlign: "center" as const,
    marginBottom: "20px",
  },
  input: {
    width: "100%",
    padding: "12px",
    marginBottom: "12px",
    borderRadius: "6px",
    border: "1px solid #ccc",
  },
  button: {
    width: "100%",
    padding: "12px",
    background: "#2563eb",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "bold" as const,
  },
  error: { color: "red", marginBottom: "10px" },
  success: { color: "green", marginBottom: "10px" },
};
