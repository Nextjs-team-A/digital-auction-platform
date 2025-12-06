"use client";

import { useEffect, useState } from "react";

export default function ProfileViewPage() {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchProfile() {
            try {
                const res = await fetch("/api/profile/me", {
                    method: "GET",
                    credentials: "include",
                });

                if (!res.ok) {
                    setLoading(false);
                    return;
                }

                const json = await res.json();
                setData(json);
            } catch (error) {
                console.error("PROFILE FETCH ERROR:", error);
            } finally {
                setLoading(false);
            }
        }

        fetchProfile();
    }, []);

    if (loading) return <p>Loading...</p>;

    if (!data) return <p>Error loading profile.</p>;

    return (
        <main style={{ padding: "2rem", maxWidth: "600px", margin: "0 auto" }}>
            <h1 style={{ fontSize: "2rem", fontWeight: "bold" }}>Your Profile</h1>

            <div
                style={{
                    marginTop: "1.5rem",
                    padding: "1.5rem",
                    borderRadius: "0.75rem",
                    background: "#fff",
                    boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
                }}
            >
                <p><strong>Email:</strong> {data.email}</p>
                <p><strong>Role:</strong> {data.role}</p>
                <p><strong>First Name:</strong> {data.profile.firstName}</p>
                <p><strong>Last Name:</strong> {data.profile.lastName}</p>
                <p><strong>Phone:</strong> {data.profile.phone}</p>
                <p><strong>Location:</strong> {data.profile.location}</p>
            </div>

            <a
                href="/profile/edit"
                style={{
                    display: "inline-block",
                    marginTop: "1.5rem",
                    padding: "0.75rem 1.5rem",
                    background: "#111827",
                    color: "white",
                    borderRadius: "0.5rem",
                    textDecoration: "none",
                }}
            >
                Edit Profile
            </a>
        </main>
    );
}
