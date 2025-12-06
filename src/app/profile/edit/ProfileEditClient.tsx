"use client";

import { useState } from "react";
import { useAuthContext } from "@/context/auth-context";
import { useRouter } from "next/navigation";

export default function ProfileEditClient() {
  const router = useRouter();
  const { user, loading, isAuthenticated } = useAuthContext();

  // ⛔ NO useEffect for setForm!
  // ⛔ NO syncing inside effect!
  // ✅ Initialize once from user safely
  const [form, setForm] = useState(() => ({
    firstName: user?.profile?.firstName || "",
    lastName: user?.profile?.lastName || "",
    phone: user?.profile?.phone || "",
    location: user?.profile?.location || "",
  }));

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  if (loading) return <p>Loading...</p>;
  if (!isAuthenticated || !user) return <p>You must be logged in.</p>;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
    setSuccess("");
  };

  const validate = () => {
    if (!form.firstName || form.firstName.length < 2)
      return "First name must be at least 2 letters.";
    if (!form.lastName || form.lastName.length < 2)
      return "Last name must be at least 2 letters.";
    if (!form.phone || form.phone.length < 8) return "Invalid phone number.";
    if (!form.location) return "Location is required.";
    return "";
  };

  const handleSave = async () => {
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch("/api/profile/update", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(form),
      });

      const data = await res.json();
      setSaving(false);

      if (!res.ok) {
        setError(data.message || "Failed to update profile");
        return;
      }

      setSuccess("Profile updated successfully ✔");
    } catch (err) {
      setSaving(false);
      setError("Something went wrong");
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>Edit Profile</h2>

        {error && <p style={styles.error}>{error}</p>}
        {success && <p style={styles.success}>{success}</p>}

        <input
          name="firstName"
          placeholder="First Name"
          value={form.firstName}
          onChange={handleChange}
          style={styles.input}
        />

        <input
          name="lastName"
          placeholder="Last Name"
          value={form.lastName}
          onChange={handleChange}
          style={styles.input}
        />

        <input
          name="phone"
          placeholder="Phone"
          value={form.phone}
          onChange={handleChange}
          style={styles.input}
        />

        <select
          name="location"
          value={form.location}
          onChange={handleChange}
          style={styles.input}
        >
          <option value="">Select Location</option>
          <option value="Beirut">Beirut</option>
          <option value="Outside Beirut">Outside Beirut</option>
        </select>

        <button onClick={handleSave} disabled={saving} style={styles.button}>
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "#f5f7fa",
  },
  card: {
    width: "100%",
    maxWidth: "400px",
    background: "#fff",
    padding: "30px",
    borderRadius: "10px",
    boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
  },
  title: {
    textAlign: "center" as const,
    marginBottom: "20px",
  },
  input: {
    width: "100%",
    padding: "12px",
    marginBottom: "12px",
    borderRadius: "6px",
    border: "1px solid #ccc",
  },
  button: {
    width: "100%",
    padding: "12px",
    background: "#2563eb",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "bold" as const,
  },
  error: { color: "red", marginBottom: "10px" },
  success: { color: "green", marginBottom: "10px" },
};
