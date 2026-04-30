"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/utils";
import MobileMenu from "./MobileMenu";
import { signOut } from "@/app/auth/actions";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/buy", label: "Buy a Car" },
  { href: "/sell", label: "Sell my Car" },
  { href: "/finance", label: "Finance" },
  { href: "/service", label: "Service & Repairs" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

interface NavbarProps {
  userEmail: string | null;
  userName: string | null;
  isAdmin: boolean;
}

export default function Navbar({ userEmail, userName, isAdmin }: NavbarProps) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);

  const displayName =
    (userName && userName.trim().split(" ")[0]) ||
    (userEmail ? userEmail.split("@")[0] : null);

  return (
    <>
      <nav className="sticky top-0 z-50 bg-navy border-b border-navy-light">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-20 items-center justify-between">
            <Link href="/" className="shrink-0">
              <Image
                src="/images/logo-transparent.png"
                alt="Ideal Cars"
                width={180}
                height={54}
                className="h-10 w-auto"
                priority
              />
            </Link>

            <div className="hidden lg:flex lg:items-center lg:gap-1">
              {navLinks.map((link) => {
                const isActive =
                  link.href === "/"
                    ? pathname === "/"
                    : pathname.startsWith(link.href);

                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      "rounded-md px-3 py-2 text-sm font-medium transition-colors",
                      isActive
                        ? "text-accent bg-navy-light"
                        : "text-silver-light hover:text-accent hover:bg-navy-light",
                    )}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              {userEmail ? (
                <div className="relative hidden sm:block">
                  <button
                    type="button"
                    onClick={() => setAccountMenuOpen((v) => !v)}
                    onBlur={() =>
                      setTimeout(() => setAccountMenuOpen(false), 150)
                    }
                    className="inline-flex items-center gap-2 rounded-md border border-accent bg-accent/10 px-3 py-1.5 text-sm font-medium text-accent transition-colors hover:bg-accent hover:text-navy"
                  >
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <span className="max-w-[8rem] truncate">{displayName}</span>
                  </button>
                  {accountMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 overflow-hidden rounded-md border border-silver bg-white shadow-lg">
                      <Link
                        href={isAdmin ? "/admin" : "/account"}
                        className="block px-4 py-2 text-sm text-navy hover:bg-gray-50"
                      >
                        {isAdmin ? "Admin Dashboard" : "My Account"}
                      </Link>
                      {!isAdmin && (
                        <>
                          <Link
                            href="/account/vehicles"
                            className="block px-4 py-2 text-sm text-navy hover:bg-gray-50"
                          >
                            My Vehicles
                          </Link>
                          <Link
                            href="/account/services"
                            className="block px-4 py-2 text-sm text-navy hover:bg-gray-50"
                          >
                            Service History
                          </Link>
                        </>
                      )}
                      <form action={signOut}>
                        <button
                          type="submit"
                          className="block w-full border-t border-silver px-4 py-2 text-left text-sm text-silver-dark hover:bg-gray-50 hover:text-navy"
                        >
                          Sign out
                        </button>
                      </form>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <Link
                    href="/signup"
                    className="hidden sm:inline-flex items-center rounded-md bg-accent px-4 py-1.5 text-sm font-medium text-navy transition-colors hover:bg-accent-dark"
                  >
                    Sign Up
                  </Link>
                  <Link
                    href="/login"
                    className="hidden sm:inline-flex items-center rounded-md border border-accent px-4 py-1.5 text-sm font-medium text-accent transition-colors hover:bg-accent hover:text-navy"
                  >
                    Login
                  </Link>
                </>
              )}

              <button
                type="button"
                onClick={() => setMobileMenuOpen(true)}
                className="lg:hidden inline-flex items-center justify-center rounded-md p-2 text-silver-light hover:bg-navy-light hover:text-accent transition-colors"
                aria-label="Open navigation menu"
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
            </div>
          </div>
        </div>
      </nav>

      <MobileMenu
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        userEmail={userEmail}
        userName={displayName}
        isAdmin={isAdmin}
      />
    </>
  );
}

export { navLinks };
