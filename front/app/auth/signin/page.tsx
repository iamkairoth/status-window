"use client";

import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation"; // Make sure useRouter is imported
import { useState } from "react";

export default function SignInPage() {
  const router = useRouter(); // Initialize useRouter
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); // Clear previous errors

    const res = await signIn("credentials", {
      email,
      password,
      // --- CHANGE THIS ---
      redirect: false, // Don't let next-auth server handle the redirect
      // --- END CHANGE ---
      callbackUrl: "/admin", // Still tell next-auth where we *want* to go
    });

    // --- ADD THIS MANUAL REDIRECT LOGIC ---
    if (res?.ok) {
      // Authentication was successful! Manually navigate.
      router.push("/admin");
    } else {
      // Authentication failed (e.g., invalid credentials handled by res.error)
      // or an unhandled error occurred server-side before success (less likely now)
      setError(res?.error || "An unexpected error occurred"); // Use error from res, or generic message
      console.error("Sign in failed:", res?.error); // Log the specific error
    }
    // --- END ADDED LOGIC ---
  };

  return (
    <div className="min-h-screen grid place-items-center">
      <form onSubmit={handleLogin} className="w-80 space-y-4">
        <h1 className="text-2xl font-bold text-center">Sign In</h1>
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <input
          type="email"
          placeholder="Email"
          className="w-full px-4 py-2 border rounded"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          className="w-full px-4 py-2 border rounded"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button
          type="submit"
          className="w-full bg-black text-white py-2 rounded hover:bg-gray-800"
        >
          Sign In
        </button>
      </form>
    </div>
  );
}