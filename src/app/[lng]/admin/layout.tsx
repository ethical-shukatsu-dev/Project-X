import React from "react";
import Link from "next/link";

export default async function AdminLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{lng: string}>;
}) {
  const {lng} = await params;

  return (
    <div className="flex flex-col min-h-screen">
      {/* Admin Header */}
      <header className="px-6 py-4 text-white bg-gray-900 border-b border-gray-800">
        <div className="container flex items-center justify-between mx-auto">
          <div className="flex items-center gap-6">
            <h1 className="text-xl font-bold">Project X Admin</h1>
            <nav className="gap-4 flex">
              <Link
                href={`/${lng}/admin`}
                className="transition-colors hover:text-blue-400"
              >
                Dashboard
              </Link>
              <Link
                href={`/${lng}/admin/analytics`}
                className="transition-colors hover:text-blue-400"
              >
                Analytics
              </Link>
              {/* <Link
                href={`/${lng}/admin/users`}
                className="transition-colors hover:text-blue-400"
              >
                Users
              </Link>
              <Link
                href={`/${lng}/admin/companies`}
                className="transition-colors hover:text-blue-400"
              >
                Companies
              </Link> */}
            </nav>
          </div>
          <div>
            <Link
              href={`/${lng}`}
              className="text-sm transition-colors hover:text-blue-400"
            >
              Back to Site
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow bg-gray-50 dark:bg-gray-900">{children}</main>

      {/* Admin Footer */}
      <footer className="px-6 py-3 text-white bg-gray-900 border-t border-gray-800">
        <div className="container mx-auto text-sm text-center">
          <p>© {new Date().getFullYear()} Project X Admin Panel</p>
        </div>
      </footer>
    </div>
  );
}
