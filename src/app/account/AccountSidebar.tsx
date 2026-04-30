"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "@/app/auth/actions";

const navItems = [
  { href: "/account", label: "Dashboard", exact: true },
  { href: "/account/profile", label: "Personal Profile" },
  { href: "/account/vehicles", label: "Car Profile" },
  { href: "/account/finance", label: "Finance Record" },
  { href: "/account/services", label: "Service & Repairs" },
];

export default function AccountSidebar({
  email,
  fullName,
}: {
  email: string;
  fullName: string | null;
}) {
  const pathname = usePathname();

  function isActive(item: (typeof navItems)[number]) {
    if (item.exact) return pathname === item.href;
    return pathname?.startsWith(item.href);
  }

  return (
    <nav className="w-full shrink-0 rounded-xl border border-silver bg-white p-4 md:w-64 md:p-6">
      <div className="mb-4 border-b border-silver pb-4">
        <p className="text-sm font-semibold text-navy">
          {fullName || "Welcome"}
        </p>
        <p className="truncate text-xs text-silver-dark" title={email}>
          {email}
        </p>
      </div>
      <ul className="flex flex-row gap-1 overflow-x-auto md:flex-col md:gap-1">
        {navItems.map((item) => {
          const active = isActive(item);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`block whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  active
                    ? "bg-navy text-white"
                    : "text-silver-dark hover:bg-gray-100 hover:text-navy"
                }`}
              >
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
      <form action={signOut} className="mt-4 hidden border-t border-silver pt-4 md:block">
        <button
          type="submit"
          className="w-full rounded-md px-3 py-2 text-left text-sm font-medium text-silver-dark hover:bg-gray-100 hover:text-navy"
        >
          Sign out
        </button>
      </form>
    </nav>
  );
}
