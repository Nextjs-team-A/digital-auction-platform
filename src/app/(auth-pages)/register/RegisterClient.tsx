"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterClient() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("USER");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password, role }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Registration failed");
        setIsLoading(false);
        return;
      }

      router.push("/profile/create");
    } catch (err) {
      console.error(err);
      setError("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <h1>Register</h1>

      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <br />
        <input
          type="password"
          placeholder="Password (min 6 chars)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <br />
        <select value={role} onChange={(e) => setRole(e.target.value)}>
          <option value="USER">User</option>
        </select>
        <br />
        <button type="submit" disabled={isLoading}>
          {isLoading ? "Registering..." : "Register"}
        </button>

        {error && <p style={{ color: "red" }}>{error}</p>}
      </form>

      <p>
        Already have an account? <Link href="/login">Login</Link>
      </p>
    </div>
  );
}
