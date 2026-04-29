"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import SignOutButton from "./SignOutButton";
import AdminSidebar from "./AdminSidebar";

export default function AdminChrome({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  if (pathname === "/admin/login" || pathname === "/admin/set-password") {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b border-silver bg-navy">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          <Link href="/admin" className="flex items-center gap-3">
            <Image
              src="/images/logo-transparent.png"
              alt="Ideal Cars"
              width={140}
              height={42}
              priority
            />
            <span className="rounded border border-accent/40 bg-accent/10 px-2 py-0.5 text-xs font-semibold uppercase tracking-wider text-accent">
              Admin
            </span>
          </Link>
          <SignOutButton />
        </div>
      </header>
      <div className="mx-auto flex max-w-7xl flex-col md:flex-row">
        <AdminSidebar />
        <main className="flex-1 px-4 py-8 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
