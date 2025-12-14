// src/app/change-email/ChangeEmailForm.tsx
"use client";

import { useState } from "react";

export default function ChangeEmailForm() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage("");
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/change-email", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ newEmail: email }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Something went wrong");
        setLoading(false);
        return;
      }

      setMessage("Email updated successfully. Check your inbox.");
      setEmail("");
    } catch (err) {
      console.error(err);
      setError("Network error. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <label>New Email:</label>
      <br />
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <br />

      {error && <p>{error}</p>}
      {message && <p>{message}</p>}

      <button type="submit" disabled={loading}>
        {loading ? "Updating..." : "Update Email"}
      </button>
      <p>
        Back to profile <a href="/profile">Back to profile </a>
      </p>
    </form>
  );
}
