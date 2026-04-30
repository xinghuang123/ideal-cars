"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/admin", label: "Dashboard", exact: true },
  { href: "/admin/contact", label: "Contact Enquiries" },
  { href: "/admin/vehicle-enquiries", label: "Vehicle Enquiries" },
  { href: "/admin/sell-requests", label: "Sell Car Requests" },
  { href: "/admin/subscribers", label: "Newsletter Subscribers" },
  { href: "/admin/chat-sessions", label: "Chat Transcripts" },
  { href: "/admin/vehicles", label: "Vehicles" },
  { href: "/admin/admins", label: "Admin Users" },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  function isActive(item: (typeof navItems)[number]) {
    if (item.exact) return pathname === item.href;
    return pathname?.startsWith(item.href);
  }

  return (
    <nav className="w-full shrink-0 border-b border-silver bg-white p-4 md:w-56 md:border-b-0 md:border-r md:p-6">
      <ul className="flex flex-row gap-1 overflow-x-auto md:flex-col md:gap-2">
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
    </nav>
  );
}
