"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CreateProfilePage() {
  const router = useRouter();

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    location: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
    setSuccess("");
  };

  const validate = () => {
    if (!form.firstName || form.firstName.length < 2) {
      return "First name must be at least 2 characters";
    }

    if (!form.lastName || form.lastName.length < 2) {
      return "Last name must be at least 2 characters";
    }

    if (!form.phone || form.phone.length < 8) {
      return "Invalid Lebanese phone number";
    }

    if (!form.location) {
      return "Location is required";
    }

    return "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch("/api/profile/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(form),
      });

      const data = await res.json();
      setLoading(false);

      if (!res.ok) {
        setError(data.message || "Failed to create profile");
        return;
      }

      setSuccess("Profile created successfully ✅");

      setTimeout(() => {
        router.push("/profile-setup/edit");
      }, 800);
    } catch (err) {
      setLoading(false);
      setError("Something went wrong");
    }
  };

  return (
    <div style={styles.container}>
      <form onSubmit={handleSubmit} style={styles.card}>
        <h2 style={styles.title}>Create Your Profile</h2>

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

        <button type="submit" disabled={loading} style={styles.button}>
          {loading ? "Saving..." : "Create Profile"}
        </button>
      </form>
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
    outline: "none",
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
  error: {
    color: "red",
    marginBottom: "10px",
    fontSize: "14px",
  },
  success: {
    color: "green",
    marginBottom: "10px",
    fontSize: "14px",
  },
};
