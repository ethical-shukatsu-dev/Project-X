"use client";

import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { usePathname } from "next/navigation";

export default function AdminLoginForm() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  
  // Extract the language code from the URL pathname (e.g. /en/admin/login -> en)
  const lng = pathname.split('/')[1];
  
  // Get the redirect parameter from the URL if it exists
  const redirectPath = searchParams.get('redirect');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/admin/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Authentication failed");
      }

      // Redirect to admin dashboard on success (using the redirect parameter if it exists)
      if (redirectPath) {
        router.push(redirectPath);
      } else {
        router.push(`/${lng}/admin/analytics`);
      }
      router.refresh();
    } catch (err: unknown) {
      const error = err instanceof Error ? err.message : "Failed to authenticate";
      setError(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="password" className="block text-sm font-medium mb-1">
          Admin Password
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Enter admin password"
          required
        />
      </div>
      
      {error && (
        <div className="text-red-500 text-sm">{error}</div>
      )}
      
      <button
        type="submit"
        disabled={loading}
        className="w-full px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
      >
        {loading ? "Authenticating..." : "Login"}
      </button>
    </form>
  );
} 