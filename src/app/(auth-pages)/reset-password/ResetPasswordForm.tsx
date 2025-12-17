"use client";

import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import AuthBackground from "@/components/AuthBackground";
import styles from "@/app/style/AuthStyles.module.css";

export default function ResetPasswordForm() {
  const router = useRouter();
  const params = useSearchParams();
  const token = params.get("token") || "";

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!password || !confirm) {
      setError("All fields required");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match");
      return;
    }

    setError("");

    try {
      const res = await fetch("/api/auth/reset-pass", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword: password }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage(
          data.message || "Password reset successful! Redirecting to login..."
        );
        // Redirect after 2 seconds so user sees the message
        setTimeout(() => {
          router.push("/login");
        }, 2000);
      } else {
        setError(data.error || "Failed to reset password");
      }
    } catch (err) {
      setError("Something went wrong. Please try again.");
    }
  }

  return (
    <AuthBackground>
      <div className={styles.card}>
        <div className={styles.iconLogo}>🔄</div>
        <h2 className={styles.title}>Reset Password</h2>

        <form onSubmit={handleSubmit}>
          <div className={styles.field}>
            <input
              type="password"
              placeholder=" "
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <label>New Password</label>
          </div>

          <div className={styles.field}>
            <input
              type="password"
              placeholder=" "
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
            />
            <label>Confirm Password</label>
          </div>

          {error && <div className={styles.errorText}>{error}</div>}

          <button className={styles.button}>Reset Password</button>
        </form>

        {message && <p className={styles.link}>{message}</p>}
      </div>
    </AuthBackground>
  );
}
