"use client";

import { useEffect, useState } from "react";

interface ProfileData {
    email: string;
    role: string;
    profile: {
        firstName?: string;
        lastName?: string;
        phone?: string;
        location?: string;
    };
}

export default function EditProfilePage() {
    const [data, setData] = useState<ProfileData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);

    // Form state
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [phone, setPhone] = useState("");
    const [location, setLocation] = useState("");

    useEffect(() => {
        async function fetchProfile() {
            try {
                const res = await fetch("/api/profile/me", {
                    method: "GET",
                    credentials: "include",
                });
                if (!res.ok) throw new Error("Failed to fetch profile");
                const json = await res.json();
                setData(json);
                setFirstName(json.profile.firstName || "");
                setLastName(json.profile.lastName || "");
                setPhone(json.profile.phone || "");
                setLocation(json.profile.location || "");
            } catch (err: any) {
                console.error(err);
                setError(err.message || "Unknown error");
            } finally {
                setLoading(false);
            }
        }
        fetchProfile();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const res = await fetch("/api/profile/me", {
                method: "PUT",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    firstName,
                    lastName,
                    phone,
                    location,
                }),
            });
            if (!res.ok) throw new Error("Failed to update profile");
            alert("Profile updated successfully!");
        } catch (err: any) {
            console.error(err);
            alert(err.message || "Error updating profile");
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <p>Loading...</p>;
    if (error) return <p>Error: {error}</p>;
    if (!data) return <p>No profile data found.</p>;

    return (
        <main style={{ padding: "2rem", maxWidth: "600px", margin: "0 auto" }}>
            <h1 style={{ fontSize: "2rem", fontWeight: "bold" }}>Edit Profile</h1>

            <form
                onSubmit={handleSubmit}
                style={{
                    marginTop: "1.5rem",
                    display: "flex",
                    flexDirection: "column",
                    gap: "1rem",
                    background: "#fff",
                    padding: "1.5rem",
                    borderRadius: "0.75rem",
                    boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
                }}
            >
                <label>
                    First Name:
                    <input
                        type="text"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        style={{ width: "100%", padding: "0.5rem", marginTop: "0.25rem" }}
                    />
                </label>

                <label>
                    Last Name:
                    <input
                        type="text"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        style={{ width: "100%", padding: "0.5rem", marginTop: "0.25rem" }}
                    />
                </label>

                <label>
                    Phone:
                    <input
                        type="text"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        style={{ width: "100%", padding: "0.5rem", marginTop: "0.25rem" }}
                    />
                </label>

                <label>
                    Location:
                    <input
                        type="text"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        style={{ width: "100%", padding: "0.5rem", marginTop: "0.25rem" }}
                    />
                </label>

                <button
                    type="submit"
                    disabled={saving}
                    style={{
                        marginTop: "1rem",
                        padding: "0.75rem 1.5rem",
                        background: "#111827",
                        color: "white",
                        borderRadius: "0.5rem",
                        border: "none",
                        cursor: "pointer",
                    }}
                >
                    {saving ? "Saving..." : "Save Changes"}
                </button>
            </form>
        </main>
    );
}