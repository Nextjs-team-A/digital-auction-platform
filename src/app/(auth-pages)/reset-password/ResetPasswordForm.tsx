"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";

export default function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessage("");

    if (newPassword !== confirmPassword) {
      setMessage("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/reset-pass", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.error || "Something went wrong");
      } else {
        setMessage(data.message || "Password reset successfully.");
      }
    } catch {
      setMessage("Network error");
    }

    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit}>
      <label>New Password:</label>
      <br />
      <input
        type="password"
        required
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
      />
      <br />
      <br />

      <label>Confirm Password:</label>
      <br />
      <input
        type="password"
        required
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
      />
      <br />

      <p>
        Back to login <a href="/login">Login</a>
      </p>
      <br />

      <button type="submit" disabled={loading}>
        {loading ? "Resetting..." : "Reset Password"}
      </button>

      {message && <p>{message}</p>}
    </form>
  );
}
