"use client";

import React, { useState } from "react";

export default function ChangePasswordForm() {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessage("");

    if (newPassword !== confirmPassword) {
      setMessage("New passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/change-pass", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // important to send cookies
        body: JSON.stringify({ oldPassword, newPassword }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.message || "Something went wrong");
      } else {
        setMessage(data.message || "Password updated successfully");
      }
    } catch {
      setMessage("Network error");
    }

    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit}>
      <label>Current Password:</label>
      <br />
      <input
        type="password"
        required
        value={oldPassword}
        onChange={(e) => setOldPassword(e.target.value)}
      />
      <br />
      <br />

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

      <label>Confirm New Password:</label>
      <br />
      <input
        type="password"
        required
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
      />
      <br />
      <br />

      <button type="submit" disabled={loading}>
        {loading ? "Updating..." : "Change Password"}
      </button>

      {message && <p>{message}</p>}

      <p>
        Back to profile <a href="/profile">Back to profile </a>
      </p>
    </form>
  );
}
