"use client";

import React from "react";
import { useAuthContext } from "@/context/auth-context";
import LogoutButton from "@/components/LogoutButton";

export default function ProfileClient() {
  const { user, loading, isAuthenticated } = useAuthContext();

  if (loading) return <p>Loading profile...</p>;

  // Extra safety: If client auth fails (rare if server passed), don't show error text, just return null or redirect
  if (!isAuthenticated || !user) {
    // Optional: window.location.href = "/login";
    return null;
  }

  return (
    <main>
      <div>
        <h2>
          {user.profile?.firstName} {user.profile?.lastName}
        </h2>
        <p>Email: {user.email}</p>
        <p>Phone: {user.profile?.phone || "Not set"}</p>
        <p>Location: {user.profile?.location || "Not set"}</p>

        <div style={{ marginTop: "20px" }}>
          <button onClick={() => (window.location.href = "/profile/edit")}>
            Edit Profile
          </button>
          <button onClick={() => (window.location.href = "/change-email")}>
            Change Email
          </button>
          <button onClick={() => (window.location.href = "/change-password")}>
            Change Password
          </button>

          <button onClick={() => (window.location.href = "/products/create")}>
            Upload Products
          </button>

          <button onClick={() => (window.location.href = "/products")}>
            Browse Products
          </button>

          <button
            onClick={() => (window.location.href = "/products/my-products")}
          >
            My Products
          </button>
          <LogoutButton />
        </div>
      </div>
    </main>
  );
}
