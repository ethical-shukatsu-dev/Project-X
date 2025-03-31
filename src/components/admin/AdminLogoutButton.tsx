"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

interface AdminLogoutButtonProps {
  lng: string;
}

export default function AdminLogoutButton({ lng }: AdminLogoutButtonProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogout = async () => {
    if (loading) return;
    
    setLoading(true);
    try {
      const response = await fetch("/api/admin/auth/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        // Redirect to login page
        router.push(`/${lng}/admin/login`);
        router.refresh();
      } else {
        console.error("Failed to logout");
      }
    } catch (error) {
      console.error("Error during logout:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      className="px-3 py-1 text-sm bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors"
      onClick={handleLogout}
      disabled={loading}
    >
      {loading ? "Logging out..." : "Logout"}
    </button>
  );
} 