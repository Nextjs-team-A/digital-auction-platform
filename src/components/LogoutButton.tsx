"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LogoutButton() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    async function handleLogout() {
        setLoading(true);
        try {
            const res = await fetch("/api/auth/logout", {
                method: "POST",
            });
            if (res.ok) {
                router.push("/login");
                router.refresh();
            }
        } catch (error) {
            console.error("Failed to logout", error);
        } finally {
            setLoading(false);
        }
    }

    return (
        <button
            onClick={handleLogout}
            disabled={loading}
            style={{
                padding: "0.75rem 1.5rem",
                backgroundColor: "#ef4444",
                color: "white",
                border: "none",
                borderRadius: "0.5rem",
                cursor: loading ? "not-allowed" : "pointer",
                fontSize: "1rem",
                fontWeight: "600",
                transition: "all 0.2s ease-in-out",
                opacity: loading ? 0.7 : 1,
                boxShadow: "0 2px 4px rgba(239, 68, 68, 0.2)",
            }}
            onMouseOver={(e) => {
                if (!loading) {
                    e.currentTarget.style.backgroundColor = "#dc2626";
                    e.currentTarget.style.transform = "translateY(-1px)";
                    e.currentTarget.style.boxShadow = "0 4px 6px rgba(239, 68, 68, 0.3)";
                }
            }}
            onMouseOut={(e) => {
                if (!loading) {
                    e.currentTarget.style.backgroundColor = "#ef4444";
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "0 2px 4px rgba(239, 68, 68, 0.2)";
                }
            }}
        >
            {loading ? "Logging out..." : "Logout"}
        </button>
    );
}
