"use client";

import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import AuthBackground from "@/components/AuthBackground";
import styles from "@/app/style/AuthStyles.module.css";

type Errors = {
  identifier?: string; // email or phone
  newPassword?: string;
  confirmPassword?: string;
};

export default function ResetPasswordClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";

  const [identifier, setIdentifier] = useState(""); // email or phone (UI confirm only)
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [errors, setErrors] = useState<Errors>({});
  const [serverError, setServerError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const isEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
  const isPhone = (v: string) => /^\+?[0-9]{7,15}$/.test(v.trim()); // basic phone validation

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    setErrors({});
    setServerError("");
    setSuccess("");

    const nextErrors: Errors = {};

    if (!identifier.trim()) {
      nextErrors.identifier = "Required";
    } else if (!isEmail(identifier) && !isPhone(identifier)) {
      nextErrors.identifier = "Enter a valid email or phone number";
    }

    if (!newPassword) nextErrors.newPassword = "Required";
    if (!confirmPassword) nextErrors.confirmPassword = "Required";
    if (newPassword && confirmPassword && newPassword !== confirmPassword) {
      nextErrors.confirmPassword = "Passwords do not match";
    }

    if (!token) {
      setServerError(
        "Missing reset token. Please use the link from your email."
      );
      return;
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setLoading(true);

    try {
      // ✅ Backend only needs token + newPassword (do NOT touch backend)
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setServerError(data?.error || "Reset failed");
        return;
      }

      setSuccess("Password reset successfully. Redirecting to login…");
      setTimeout(() => router.push("/login"), 2000);
    } catch {
      setServerError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthBackground>
      <div className={styles.centerWrapper}>
        <div className={styles.card}>
          <h2 className={styles.title}>Reset Password</h2>

          {serverError && (
            <div
              style={{
                marginBottom: "12px",
                color: "#dc2626",
                fontSize: "0.9rem",
                fontWeight: 600,
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
              }}
            >
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            {/* Email or Phone (UI confirm only) */}
            <div
              className={`${styles.field} ${
                errors.identifier ? styles.fieldError : ""
              }`}
            >
              <input
                type="text"
                placeholder=" "
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
              />
              <label>Email or Phone</label>
              {errors.identifier && (
                <div className={styles.errorText}>{errors.identifier}</div>
              )}
            </div>

            {/* New Password */}
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

            {/* Confirm Password */}
            <div
              className={`${styles.field} ${
                errors.confirmPassword ? styles.fieldError : ""
              }`}
            >
              <input
                type="password"
                placeholder=" "
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              <label>Confirm New Password</label>
              {errors.confirmPassword && (
                <div className={styles.errorText}>{errors.confirmPassword}</div>
              )}
            </div>

            <button className={styles.button} disabled={loading}>
              {loading ? "Resetting..." : "Reset password"}
            </button>
          </form>

          <a href="/login" className={styles.link}>
            Back to login
          </a>
        </div>
      </div>
    </AuthBackground>
  );
}
