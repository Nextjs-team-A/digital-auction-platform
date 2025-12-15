"use client";

import { useState } from "react";
import AuthBackground from "@/components/AuthBackground";
import styles from "@/app/style/AuthStyles.module.css";

export default function ForgotPasswordClient() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) {
      setError("Required");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/forgot-pass", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      setMessage(data.message || "If email exists, reset link sent.");
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthBackground>
      <div className={styles.card}>
        <div className={styles.iconLogo}>🔒</div>
        <h2 className={styles.title}>Forgot Password</h2>

        <form onSubmit={handleSubmit}>
          <div className={`${styles.field} ${error ? styles.fieldError : ""}`}>
            <input placeholder=" " value={email} onChange={(e) => setEmail(e.target.value)} />
            <label>Email</label>
            {error && <div className={styles.errorText}>{error}</div>}
          </div>

          <button className={styles.button} disabled={loading}>
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
        </form>

        {message && <p className={styles.link}>{message}</p>}
        <a href="/login" className={styles.link}>Back to login</a>
      </div>
    </AuthBackground>
  );
}
