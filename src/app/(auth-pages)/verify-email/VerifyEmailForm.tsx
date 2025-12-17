"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import AuthBackground from "@/components/AuthBackground";
import styles from "@/app/style/AuthStyles.module.css";

export default function VerifyEmailForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [status, setStatus] = useState<"loading" | "success" | "error">(
    token ? "loading" : "error"
  );
  const [message, setMessage] = useState(
    token ? "" : "Invalid link: Token is missing"
  );

  useEffect(() => {
    if (!token) return;

    const verifyToken = async () => {
      try {
        const res = await fetch(`/api/auth/verify-token?token=${token}`);
        const data = await res.json();

        if (res.ok) {
          setStatus("success");
          setMessage(
            "Email verified successfully! You can now reset your password."
          );
        } else {
          setStatus("error");
          setMessage(data.error || "Link is invalid or expired.");
        }
      } catch (error) {
        setStatus("error");
        setMessage("Something went wrong. Please try again.");
      }
    };

    verifyToken();
  }, [token]);

  const handleProceed = () => {
    router.push(`/reset-password?token=${token}`);
  };

  return (
    <AuthBackground>
      <div className={styles.card}>
        {status === "loading" && (
          <>
            <div className={styles.iconLogo}>⏳</div>
            <h2 className={styles.title}>Verifying Email...</h2>
            <p style={{ textAlign: "center", color: "#666" }}>
              Please wait a moment.
            </p>
          </>
        )}

        {status === "success" && (
          <>
            <div className={styles.iconLogo}>✅</div>
            <h2 className={styles.title}>Email Verified</h2>
            <p
              style={{
                textAlign: "center",
                color: "#666",
                marginBottom: "20px",
              }}
            >
              {message}
            </p>
            <button className={styles.button} onClick={handleProceed}>
              Reset Password
            </button>
          </>
        )}

        {status === "error" && (
          <>
            <div className={styles.iconLogo}>❌</div>
            <h2 className={styles.title}>Verification Failed</h2>
            <div className={styles.errorText} style={{ marginBottom: "20px" }}>
              {message}
            </div>
            <button
              className={styles.button}
              onClick={() => router.push("/forgot-password")}
            >
              Request New Link
            </button>
          </>
        )}
      </div>
    </AuthBackground>
  );
}
