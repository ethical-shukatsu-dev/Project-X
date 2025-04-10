import React, { Suspense } from 'react';
import { Metadata } from 'next';
import AdminLoginForm from '@/components/admin/AdminLoginForm';

export const metadata: Metadata = {
  title: 'Admin Login',
  description: 'Login to access admin features',
};

// Loading component to show while AdminLoginForm is loading
function LoginFormLoading() {
  return (
    <div className="w-full text-center p-4">
      <div className="animate-pulse">Loading login form...</div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <div className="container flex items-center justify-center max-w-md mx-auto p-8 min-h-[80vh]">
      <div className="w-full bg-white dark:bg-gray-800 rounded-lg shadow-md p-8">
        <h1 className="text-2xl font-bold text-center mb-6">Admin Login</h1>
        <Suspense fallback={<LoginFormLoading />}>
          <AdminLoginForm />
        </Suspense>
      </div>
    </div>
  );
}
