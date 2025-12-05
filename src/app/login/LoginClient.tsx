// src/app/login/LoginClient.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

/**
 * LoginClient Component
 *
 * This page handles:
 * - User login form
 * - Sending credentials to /api/auth/login
 * - Refreshing the global auth session AFTER a successful login
 * - Redirecting the user to /profile
 *
 * It works together with the Global Auth Context, which:
 * - Automatically rehydrates session on page load
 * - Loads authenticated user data
 * - Provides refreshSession() and logout()
 */
export default function LoginClient() {
  const router = useRouter();

  // Pull refreshSession() from global AuthContext
  // refreshSession() --> fetches /api/auth/me + /api/profile/me and updates global user state
  const { refreshSession } = useAuth();

  // Form fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // UI state
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  /**
   * Handle Login Submission
   *
   * Steps:
   * 1) Send email + password to backend
   * 2) If login is successful → backend sets HttpOnly auth cookies
   * 3) Call refreshSession() to load user into global context
   * 4) Redirect user to profile page
   */
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // 1️⃣ Send login request
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // Important: ensures HttpOnly cookies are stored
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      // 2️⃣ Handle failed login
      if (!res.ok) {
        setError(data.message || "Login failed");
        setLoading(false);
        return;
      }

      // 3️⃣ Login successful → refresh global session
      // This loads user → AuthContext.user = { id, email, role, profile }
      await refreshSession();

      // 4️⃣ Move user to profile page
      router.push("/profile");
    } catch (err) {
      console.error(err);
      setError("Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main>
      <h1>Login</h1>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {/* Login Form */}
      <form onSubmit={handleSubmit}>
        <label>Email:</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <br />

        <label>Password:</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <br />

        <button type="submit" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>

      <p>
        Do not have an account? <a href="/register">Register</a>
      </p>

      <p>
        Forgot Password? <a href="/forgot-password">Forgot Password</a>
      </p>
    </main>
  );
}
