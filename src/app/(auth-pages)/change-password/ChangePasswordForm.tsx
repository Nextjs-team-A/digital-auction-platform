"use client";

import { useState } from "react";
import AuthBackground from "@/components/AuthBackground";
import styles from "@/app/style/AuthStyles.module.css";

export default function ChangePasswordForm() {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  const [errors, setErrors] = useState<{
    oldPassword?: string;
    newPassword?: string;
    confirm?: string;
  }>({});

  const [serverError, setServerError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

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

  return (
    <AuthBackground>
      <div className={styles.card}>
        <h2 className={styles.title}>Change Password</h2>
        <p className={styles.subtitle}>
          Change your password.
        </p>

        {serverError && (
          <div className={styles.errorText}>{serverError}</div>
        )}

        {success && (
          <div style={{ color: "#059669", fontWeight: 700, marginBottom: 12 }}>
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          {/* OLD */}
          <div className={`${styles.field} ${errors.oldPassword ? styles.fieldError : ""}`}>
            <input
              type="password"
              placeholder=" "
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
            />
            <label>Current Password</label>
            {errors.oldPassword && <div className={styles.errorText}>{errors.oldPassword}</div>}
          </div>

          {/* NEW */}
          <div className={`${styles.field} ${errors.newPassword ? styles.fieldError : ""}`}>
            <input
              type="password"
              placeholder=" "
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
            <label>New Password</label>
            {errors.newPassword && <div className={styles.errorText}>{errors.newPassword}</div>}
          </div>

          {/* CONFIRM */}
          <div className={`${styles.field} ${errors.confirm ? styles.fieldError : ""}`}>
            <input
              type="password"
              placeholder=" "
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
            />
            <label>Confirm New Password</label>
            {errors.confirm && <div className={styles.errorText}>{errors.confirm}</div>}
          </div>

          <button className={styles.button} disabled={loading}>
            {loading ? "Updating..." : "Change Password"}
          </button>
        </form>
      </div>
    </AuthBackground>
  );
}
