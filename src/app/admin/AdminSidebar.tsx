"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

const navItems = [
  { href: "/admin", label: "Dashboard", exact: true },
  { href: "/admin/insights", label: "Insights" },
  { href: "/admin/contact", label: "Contact Enquiries" },
  { href: "/admin/vehicle-enquiries", label: "Vehicle Enquiries" },
  { href: "/admin/sell-requests", label: "Sell Car Requests" },
  { href: "/admin/finance", label: "Finance Applications" },
  { href: "/admin/subscribers", label: "Newsletter Subscribers" },
  { href: "/admin/customers", label: "Customers" },
  { href: "/admin/chat-sessions", label: "Chat Transcripts" },
  { href: "/admin/vehicles", label: "Vehicles" },
  { href: "/admin/site-content", label: "Site Content" },
  { href: "/admin/admins", label: "Admin Users" },
];

interface AdminSidebarProps {
  mobileOpen: boolean;
  onMobileClose: () => void;
}

export default function AdminSidebar({
  mobileOpen,
  onMobileClose,
}: AdminSidebarProps) {
  const pathname = usePathname();

  function isActive(item: (typeof navItems)[number]) {
    if (item.exact) return pathname === item.href;
    return pathname?.startsWith(item.href);
  }

  // Lock body scroll when mobile drawer is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  // Close drawer on route change (only react to actual pathname changes)
  const prevPathnameRef = useRef(pathname);
  useEffect(() => {
    if (prevPathnameRef.current !== pathname) {
      prevPathnameRef.current = pathname;
      onMobileClose();
    }
  }, [pathname, onMobileClose]);

  const navList = (
    <ul className="flex flex-col gap-1">
      {navItems.map((item) => {
        const active = isActive(item);
        return (
          <li key={item.href}>
            <Link
              href={item.href}
              onClick={onMobileClose}
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
  );

  return (
    <>
      {/* Desktop sidebar */}
      <nav className="hidden w-56 shrink-0 border-r border-silver bg-white p-6 md:block">
        {navList}
      </nav>

      {/* Mobile drawer overlay */}
      <div
        className={`fixed inset-0 z-50 bg-black/60 transition-opacity duration-300 md:hidden ${
          mobileOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={onMobileClose}
        aria-hidden="true"
      />

      {/* Mobile drawer panel */}
      <aside
        className={`fixed left-0 top-0 z-50 h-full w-72 bg-white shadow-2xl transition-transform duration-300 ease-in-out md:hidden ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-silver px-5 py-4">
          <span className="text-sm font-semibold uppercase tracking-wider text-navy">
            Admin Menu
          </span>
          <button
            type="button"
            onClick={onMobileClose}
            className="inline-flex items-center justify-center rounded-md p-2 text-silver-dark hover:bg-gray-100 hover:text-navy"
            aria-label="Close admin menu"
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
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
        <nav className="p-4">{navList}</nav>
      </aside>
    </>
  );
}
