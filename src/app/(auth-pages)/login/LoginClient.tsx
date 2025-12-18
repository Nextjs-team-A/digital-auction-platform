"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import AuthBackground from "@/components/AuthBackground";
import styles from "@/app/style/AuthStyles.module.css";
import { useAuthContext } from "@/context/auth-context";

export default function LoginClient() {
  const router = useRouter();
  const { refreshSession } = useAuthContext();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setServerError("");

    const errs: typeof errors = {};
    if (!email) errs.email = "Required";
    if (!password) errs.password = "Required";

    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }

    setErrors({});
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setServerError(data.message || "Invalid credentials");
        return;
      }

      await refreshSession();
      router.push("/profile");
    } catch {
      setServerError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthBackground>
      <div className={styles.card}>

        <h2 className={styles.title}>Login</h2>
        <p className={styles.subtitle}>
          Login to your account.
        </p>
        {serverError && <div className={styles.errorText}>{serverError}</div>}

        <form onSubmit={handleSubmit} noValidate>
          <div className={`${styles.field} ${errors.email ? styles.fieldError : ""}`}>
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

          <div
            className={`${styles.field} ${
              errors.password ? styles.fieldError : ""
            }`}
          >
            <input
              type="password"
              placeholder=" "
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <label>Password</label>
            {errors.password && (
              <div className={styles.errorText}>{errors.password}</div>
            )}
          </div>

          <button className={styles.button} disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <a href="/forgot-password" className={styles.link}>
          Forgot password?
        </a>
      </div>
    </AuthBackground>
  );
}
