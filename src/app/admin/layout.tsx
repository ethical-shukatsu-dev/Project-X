import React from 'react';

export const metadata = {
  title: 'Admin Dashboard',
  description: 'Project X Admin Dashboard',
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  // This layout is only for redirects to localized routes
  return <>{children}</>;
}
