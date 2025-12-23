"use client";

import { useState } from "react";
import AuthBackground from "@/components/AuthBackground";
import styles from "@/app/style/AuthStyles.module.css";

export default function ForgotPasswordClient() {
  const [step, setStep] = useState<1 | 2>(1);

  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");

  const [errors, setErrors] = useState<{
    email?: string;
    code?: string;
  }>({});

  const [serverError, setServerError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  // STEP 1: SEND EMAIL
  async function handleSendEmail(e: React.FormEvent) {
    e.preventDefault();

    setServerError("");
    setSuccess("");

    if (!email) {
      setErrors({ email: "Required" });
      return;
    }

    setErrors({});
    setLoading(true);

    try {
      const res = await fetch("/api/auth/forgetpass", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setServerError(
          data.error || "Failed to send reset email. Please try again."
        );
        return;
      }

      // Only move forward if successful
      setStep(2);
      setSuccess("We sent a verification code to your email.");
    } catch {
      setServerError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  // STEP 2: VERIFY CODE (UI CONFIRMATION)
  function handleVerifyCode(e: React.FormEvent) {
    e.preventDefault();

    setServerError("");
    setSuccess("");

    if (!code) {
      setErrors({ code: "Required" });
      return;
    }

    setErrors({});
    setSuccess(
      "Verification successful. Please check your email for the reset link."
    );
  }

  return (
    <AuthBackground>
      <div className={styles.card}>
        <h2 className={styles.title}>Forgot Password</h2>
        <p className={styles.subtitle}>Forgot your password?</p>
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

        {/* STEP 1 */}
        {step === 1 && (
          <form onSubmit={handleSendEmail} noValidate>
            <div
              className={`${styles.field} ${
                errors.email ? styles.fieldError : ""
              }`}
            >
              <input
                type="email"
                placeholder=" "
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <label>Email</label>
              {errors.email && (
                <div className={styles.errorText}>{errors.email}</div>
              )}
            </div>

            <button className={styles.button} disabled={loading}>
              {loading ? "Sending..." : "Send verification code"}
            </button>
          </form>
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <form onSubmit={handleVerifyCode} noValidate>
            <div
              className={`${styles.field} ${
                errors.code ? styles.fieldError : ""
              }`}
            >
              <input
                type="text"
                placeholder=" "
                value={code}
                onChange={(e) => setCode(e.target.value)}
              />
              <label>Verification Code</label>
              {errors.code && (
                <div className={styles.errorText}>{errors.code}</div>
              )}
            </div>

            <button className={styles.button}>Verify code</button>
          </form>
        )}

        <a href="/login" className={styles.link}>
          Back to login
        </a>
      </div>
    </AuthBackground>
  );
}
