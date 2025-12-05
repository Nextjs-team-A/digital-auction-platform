// src/app/profile/ProfileClient.tsx
"use client";

import React from "react";
import LogoutButton from "@/components/LogoutButton";

export default function ProfileClient() {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(to bottom right, #f3f4f6, #e5e7eb)",
        fontFamily: "var(--font-geist-sans), sans-serif",
      }}
    >
      <div
        style={{
          backgroundColor: "white",
          padding: "2rem",
          borderRadius: "1rem",
          boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
          textAlign: "center",
          maxWidth: "400px",
          width: "100%",
        }}
      >
        <h1
          style={{
            fontSize: "1.875rem",
            fontWeight: "bold",
            color: "#111827",
            marginBottom: "1rem",
          }}
        >
          Welcome Back
        </h1>
        <p
          style={{
            color: "#4b5563",
            marginBottom: "2rem",
          }}
        >
          You are successfully logged in.
        </p>

        <LogoutButton />
        <p style={{ color: "black" }}>
          change email <a href="/change-email">change email</a>
        </p>
        <p style={{ color: "black" }}>
          change password <a href="/change-password">change password</a>
        </p>
      </div>
    </main>
  );
}
