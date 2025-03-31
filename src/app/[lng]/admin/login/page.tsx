import React from "react";
import { Metadata } from "next";
import AdminLoginForm from "@/components/admin/AdminLoginForm";

export const metadata: Metadata = {
  title: "Admin Login",
  description: "Login to access admin features",
};

export default function AdminLoginPage() {
  return (
    <div className="container flex items-center justify-center max-w-md mx-auto p-8 min-h-[80vh]">
      <div className="w-full bg-white dark:bg-gray-800 rounded-lg shadow-md p-8">
        <h1 className="text-2xl font-bold text-center mb-6">Admin Login</h1>
        <AdminLoginForm />
      </div>
    </div>
  );
} 