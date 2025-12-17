"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import AuthBackground from "@/components/AuthBackground";
import styles from "@/app/style/AuthStyles.module.css";

export default function RegisterClient() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("USER");

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
        body: JSON.stringify({ email, password, role }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrors({
          email: data.message || "Registration failed",
        });
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
        <p className={styles.subtitle}>
          Register to create an account.
        </p>
        <form onSubmit={handleSubmit} noValidate>
          {/* EMAIL */}
          <div
            className={`${styles.field} ${errors.email ? styles.fieldError : ""
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
            className={`${styles.field} ${errors.password ? styles.fieldError : ""
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

          {/* ROLE */}
          <div className={styles.field}>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              style={{
                width: "100%",
                padding: "14px 12px",
                borderRadius: "12px",
                background: "rgba(5, 17, 32, 0.6)",
                border: "1px solid rgba(255,255,255,0.15)",
                color: "#f5f6fa",
              }}
            >
              <option value="USER">User</option>
            </select>
          </div>

          <button className={styles.button} disabled={loading}>
            {loading ? "Creating..." : "Register"}
          </button>
        </form>

        <a href="/login" className={styles.link}>
          Already have an account? Login
        </a>
      </div >
    </AuthBackground >
  );
}
