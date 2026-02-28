"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/utils";
import MobileMenu from "./MobileMenu";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/buy", label: "Buy a Car" },
  { href: "/sell", label: "Sell my Car" },
  { href: "/finance", label: "Finance" },
  { href: "/service", label: "Service & Repairs" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      <nav className="sticky top-0 z-50 bg-navy border-b border-navy-light">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-20 items-center justify-between">
            {/* Logo */}
            <Link href="/" className="shrink-0">
              <Image
                src="/images/logo-transparent.png"
                alt="Ideal Cars"
                width={220}
                height={66}
                className="h-14 w-auto"
                priority
              />
            </Link>

            {/* Desktop Navigation Links */}
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
                        : "text-silver-light hover:text-accent hover:bg-navy-light"
                    )}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </div>

            {/* Right side: Login + Hamburger */}
            <div className="flex items-center gap-3">
              {/* Login Button - visible on all sizes */}
              <Link
                href="/login"
                className="hidden sm:inline-flex items-center rounded-md border border-accent px-4 py-1.5 text-sm font-medium text-accent transition-colors hover:bg-accent hover:text-navy"
              >
                Login
              </Link>

              {/* Hamburger Menu Button - visible on lg and below */}
              <button
                type="button"
                onClick={() => setMobileMenuOpen(true)}
                className="lg:hidden inline-flex items-center justify-center rounded-md p-2 text-silver-light hover:bg-navy-light hover:text-accent transition-colors"
                aria-label="Open navigation menu"
              >
                {/* Hamburger icon */}
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

      {/* Mobile Menu */}
      <MobileMenu
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      />
    </>
  );
}

export { navLinks };
