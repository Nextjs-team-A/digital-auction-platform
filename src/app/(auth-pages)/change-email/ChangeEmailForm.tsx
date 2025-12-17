"use client";

import { useState } from "react";
import AuthBackground from "@/components/AuthBackground";
import styles from "@/app/style/AuthStyles.module.css";

export default function ChangeEmailClient() {
  const [currentEmail, setCurrentEmail] = useState("");
  const [newEmail, setNewEmail] = useState("");

  const [errors, setErrors] = useState<{
    currentEmail?: string;
    newEmail?: string;
  }>({});

  const [serverError, setServerError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    setServerError("");
    setSuccess("");

    const newErrors: typeof errors = {};
    if (!currentEmail) newErrors.currentEmail = "Required";
    if (!newEmail) newErrors.newEmail = "Required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setLoading(true);

    try {
      const res = await fetch("/api/auth/change-email", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          currentEmail,
          newEmail,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setServerError(data?.message || "Failed to update email");
        return;
      }

      // UX-safe success message
      setSuccess(
        "Your email has been updated. A confirmation email was sent."
      );

      setCurrentEmail("");
      setNewEmail("");
    } catch {
      setServerError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthBackground>
      <div className={styles.card}>
        <h2 className={styles.title}>Change Email</h2>
        <p className={styles.subtitle}>
          Change your email.
        </p>

        {serverError && (
          <div
            style={{
              marginBottom: "12px",
              color: "#dc2626",
              fontSize: "0.9rem",
              fontWeight: 600,
              textAlign: "center",
            }}
          >
            {serverError}
          </div>
        )}

        {success && (
          <div
            style={{
              marginBottom: "12px",
              color: "#059669",
              fontSize: "0.9rem",
              fontWeight: 700,
              textAlign: "center",
            }}
          >
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          {/* CURRENT EMAIL */}
          <div
            className={`${styles.field} ${errors.currentEmail ? styles.fieldError : ""
              }`}
          >
            <input
              type="email"
              placeholder=" "
              value={currentEmail}
              onChange={(e) => setCurrentEmail(e.target.value)}
            />
            <label>Current Email</label>
            {errors.currentEmail && (
              <div className={styles.errorText}>
                {errors.currentEmail}
              </div>
            )}
          </div>

          {/* NEW EMAIL */}
          <div
            className={`${styles.field} ${errors.newEmail ? styles.fieldError : ""
              }`}
          >
            <input
              type="email"
              placeholder=" "
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
            />
            <label>New Email</label>
            {errors.newEmail && (
              <div className={styles.errorText}>
                {errors.newEmail}
              </div>
            )}
          </div>

          <button className={styles.button} disabled={loading}>
            {loading ? "Updating..." : "Change Email"}
          </button>
        </form>

        <a href="/profile" className={styles.link}>
          Back to profile
        </a>
      </div>
    </AuthBackground>
  );
}
