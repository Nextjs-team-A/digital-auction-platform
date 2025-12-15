"use client";

import { useState } from "react";
import AuthBackground from "@/components/AuthBackground";
import styles from "@/app/style/AuthStyles.module.css";

export default function ChangeEmailForm() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) {
      setError("Required");
      return;
    }

    setError("");
    setMessage("Email updated successfully");
  }

  return (
    <AuthBackground>
      <div className={styles.card}>
        <div className={styles.iconLogo}>📧</div>
        <h2 className={styles.title}>Change Email</h2>

        <form onSubmit={handleSubmit}>
          <div className={`${styles.field} ${error ? styles.fieldError : ""}`}>
            <input placeholder=" " value={email} onChange={(e) => setEmail(e.target.value)} />
            <label>New Email</label>
            {error && <div className={styles.errorText}>{error}</div>}
          </div>

          <button className={styles.button}>Update Email</button>
        </form>

        {message && <p className={styles.link}>{message}</p>}
      </div>
    </AuthBackground>
  );
}
