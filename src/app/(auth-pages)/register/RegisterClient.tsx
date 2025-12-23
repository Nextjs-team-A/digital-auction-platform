"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import AuthBackground from "@/components/AuthBackground";
import styles from "@/app/style/AuthStyles.module.css";

export default function RegisterClient() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
  }>({});

  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const newErrors: { email?: string; password?: string } = {};

    if (!email) newErrors.email = "Required";
    if (!password) newErrors.password = "Required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        /**
         * Backend validation errors (Zod)
         * Example:
         * {
         *   errors: {
         *     email: ["Invalid email"],
         *     password: ["Password must be at least 8 characters"]
         *   }
         * }
         */
        if (data?.errors) {
          setErrors({
            email: data.errors.email?.[0],
            password: data.errors.password?.[0],
          });
        } else if (data?.message) {
          // Non-validation error (e.g. email exists)
          setErrors({ email: data.message });
        } else {
          setErrors({ email: "Something went wrong" });
        }
        return;
      }

      router.push("/profile/create");
    } catch {
      setErrors({
        email: "Network error. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthBackground>
      <div className={styles.card}>
        <h2 className={styles.title}>Create Account</h2>
        <form onSubmit={handleSubmit} noValidate>
          {/* EMAIL */}
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

          {/* PASSWORD */}
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
            {loading ? "Creating..." : "Register"}
          </button>
        </form>

        <a href="/login" className={styles.link}>
          Already have an account? Login
        </a>
      </div>
    </AuthBackground>
  );
}
