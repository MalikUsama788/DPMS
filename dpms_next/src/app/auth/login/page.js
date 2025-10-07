"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { saveEncodedDataToSession, decodeSessionData } from "@/utils/session";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Redirect if already Logged in
  useEffect(() => {
    const jwt = decodeSessionData("dpms_jwt");
    const user = decodeSessionData("dpms_user");

    if (jwt && user) {
      router.replace("/admin/dashboard");
    }
  }, [router]);

  // Logged in function
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error?.message || "Invalid credentials");
        return;
      }

      // Save User + Token in Session
      saveEncodedDataToSession("dpms_jwt", data.jwt);
      saveEncodedDataToSession("dpms_user", {
        id: data.user.id,
        username: data.user.username,
        email: data.user.email,
        location: data.user.location,
        name: data.user.name,
        documentId: data.user.documentId,
      });

      toast.success("Login successful!");
      router.push("/admin/dashboard");
    } catch (err) {
      toast.error("Something went wrong, please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <h2 className="text-2xl font-bold text-center mb-4">Login</h2>

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full border border-gray-300 p-2 mb-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border border-gray-300 p-2 mb-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
    </>
  );
}
