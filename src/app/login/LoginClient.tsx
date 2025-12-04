// src/app/login/LoginClient.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginClient() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
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
        setError(data.message || "Login failed");
        setLoading(false);
        return;
      }

      // Redirect user (later to dashboard)
      router.push("/profile");
    } catch (err) {
      setError("Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main>
      <h1>Login</h1>

      {error && <p style={{ color: "red" }}>{error}</p>}

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
