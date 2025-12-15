"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import AuthBackground from "@/components/AuthBackground";
import styles from "@/app/style/AuthStyles.module.css";

export default function LoginClient() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const newErrors: typeof errors = {};
    if (!email) newErrors.email = "Required";
    if (!password) newErrors.password = "Required";

    if (Object.keys(newErrors).length) {
      setErrors(newErrors);
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
        setErrors({ email: data.message || "Login failed" });
        return;
      }

      router.push("/profile");
    } catch {
      setErrors({ email: "Network error" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthBackground>
      <div className={styles.card}>
        <div className={styles.logo}>
          <img src="/logo-auction.png" alt="Auction Logo" />
        </div>

        <h2 className={styles.title}>Welcome Back</h2>

        <form onSubmit={handleSubmit} noValidate>
          <div className={`${styles.field} ${errors.email ? styles.fieldError : ""}`}>
            <input placeholder=" " value={email} onChange={(e) => setEmail(e.target.value)} />
            <label>Email</label>
            {errors.email && <div className={styles.errorText}>{errors.email}</div>}
          </div>

          <div className={`${styles.field} ${errors.password ? styles.fieldError : ""}`}>
            <input
              type="password"
              placeholder=" "
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <label>Password</label>
            {errors.password && <div className={styles.errorText}>{errors.password}</div>}
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
