"use client";

import { useState } from "react";
import AuthBackground from "@/components/AuthBackground";
import styles from "@/app/style/AuthStyles.module.css";

export default function ChangePasswordForm() {
  const [oldPass, setOldPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirm, setConfirm] = useState("");

  const [errors, setErrors] = useState<{
    oldPass?: string;
    newPass?: string;
    confirm?: string;
  }>({});

  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const newErrors: typeof errors = {};

    if (!oldPass) newErrors.oldPass = "Required";
    if (!newPass) newErrors.newPass = "Required";
    if (!confirm) newErrors.confirm = "Required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    if (newPass !== confirm) {
      setErrors({ confirm: "Passwords do not match" });
      return;
    }

    setErrors({});
    setLoading(true);

    try {
      const res = await fetch("/api/auth/change-pass", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ oldPassword: oldPass, newPassword: newPass }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrors({ oldPass: data.message || "Failed to update password" });
        return;
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthBackground>
      <div className={styles.card}>
        <div className={styles.iconLogo}>🔐</div>
        <h2 className={styles.title}>Change Password</h2>

        <form onSubmit={handleSubmit} noValidate>
          {/* CURRENT PASSWORD */}
          <div
            className={`${styles.field} ${errors.oldPass ? styles.fieldError : ""
              }`}
          >
            <input
              type="password"
              placeholder=" "
              value={oldPass}
              onChange={(e) => setOldPass(e.target.value)}
            />
            <label>Current Password</label>
            {errors.oldPass && (
              <div className={styles.errorText}>{errors.oldPass}</div>
            )}
          </div>

          {/* NEW PASSWORD */}
          <div
            className={`${styles.field} ${errors.newPass ? styles.fieldError : ""
              }`}
          >
            <input
              type="password"
              placeholder=" "
              value={newPass}
              onChange={(e) => setNewPass(e.target.value)}
            />
            <label>New Password</label>
            {errors.newPass && (
              <div className={styles.errorText}>{errors.newPass}</div>
            )}
          </div>

          {/* CONFIRM PASSWORD */}
          <div
            className={`${styles.field} ${errors.confirm ? styles.fieldError : ""
              }`}
          >
            <input
              type="password"
              placeholder=" "
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
            />
            <label>Confirm Password</label>
            {errors.confirm && (
              <div className={styles.errorText}>{errors.confirm}</div>
            )}
          </div>

          <button className={styles.button} disabled={loading}>
            {loading ? "Updating..." : "Update Password"}
          </button>
        </form>
      </div>
    </AuthBackground>
  );
}
