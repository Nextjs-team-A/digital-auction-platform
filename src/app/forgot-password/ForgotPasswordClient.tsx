"use client";

import React, { useState } from "react";

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const res = await fetch("/api/auth/forgot-pass", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.error || "Something went wrong");
      } else {
        setMessage("If this email exists, a reset link has been sent.");
      }
    } catch {
      setMessage("Network error");
    }

    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit}>
      <label>Email:</label>
      <br />
      <input
        type="email"
        name="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <br />
      <p>
        Back to login <a href="/login">Login</a>
      </p>
      <br />
      <button type="submit" disabled={loading}>
        {loading ? "Sending..." : "Send Reset Link"}
      </button>
      {message && <p>{message}</p>}
    </form>
  );
}
