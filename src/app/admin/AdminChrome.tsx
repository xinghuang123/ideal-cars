"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import SignOutButton from "./SignOutButton";
import AdminSidebar from "./AdminSidebar";

export default function AdminChrome({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  if (pathname === "/admin/login" || pathname === "/admin/set-password") {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b border-silver bg-navy">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setMobileNavOpen(true)}
              className="inline-flex items-center justify-center rounded-md p-2 text-silver-light hover:bg-navy-light hover:text-accent transition-colors md:hidden"
              aria-label="Open admin menu"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3.75 6.75h16.5M3.75 12h16.5M3.75 17.25h16.5"
                />
              </svg>
            </button>
            <Link href="/admin" className="flex items-center gap-3">
              <Image
                src="/images/logo-transparent.png"
                alt="Ideal Cars"
                width={140}
                height={42}
                priority
                className="h-8 w-auto sm:h-10"
              />
              <span className="rounded border border-accent/40 bg-accent/10 px-2 py-0.5 text-xs font-semibold uppercase tracking-wider text-accent">
                Admin
              </span>
            </Link>
          </div>
          <SignOutButton />
        </div>
      </header>
      <div className="mx-auto flex max-w-7xl flex-col md:flex-row">
        <AdminSidebar
          mobileOpen={mobileNavOpen}
          onMobileClose={() => setMobileNavOpen(false)}
        />
        <main className="flex-1 px-4 py-8 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
