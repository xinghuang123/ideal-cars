"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { navLinks } from "./Navbar";
import { signOut } from "@/app/auth/actions";

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  userEmail: string | null;
  userName: string | null;
  isAdmin: boolean;
}

export default function MobileMenu({
  isOpen,
  onClose,
  userEmail,
  userName,
  isAdmin,
}: MobileMenuProps) {
  const pathname = usePathname();

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Close menu when route changes
  const prevPathnameRef = useRef(pathname);
  useEffect(() => {
    if (prevPathnameRef.current !== pathname) {
      prevPathnameRef.current = pathname;
      onClose();
    }
  }, [pathname, onClose]);

  return (
    <>
      {/* Overlay */}
      <div
        className={cn(
          "fixed inset-0 z-50 bg-black/60 transition-opacity duration-300 lg:hidden",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Slide-in Panel */}
      <div
        className={cn(
          "fixed top-0 right-0 z-50 h-full w-72 bg-navy shadow-2xl transition-transform duration-300 ease-in-out lg:hidden",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        {/* Header with logo and close button */}
        <div className="flex items-center justify-between border-b border-navy-light px-5 py-4">
          <Link href="/" onClick={onClose}>
            <Image
              src="/images/logo-transparent.png"
              alt="Ideal Cars"
              width={110}
              height={33}
              className="h-7 w-auto"
            />
          </Link>

          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center justify-center rounded-md p-2 text-silver-light hover:bg-navy-light hover:text-accent transition-colors"
            aria-label="Close navigation menu"
          >
            {/* X icon */}
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

        {/* Navigation Links */}
        <nav className="px-3 py-4">
          <ul className="flex flex-col gap-1">
            {navLinks.map((link) => {
              const isActive =
                link.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(link.href);

              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    onClick={onClose}
                    className={cn(
                      "block rounded-md px-4 py-3 text-sm font-medium transition-colors",
                      isActive
                        ? "text-accent bg-navy-light"
                        : "text-silver-light hover:text-accent hover:bg-navy-light"
                    )}
                  >
                    {link.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="absolute bottom-0 left-0 right-0 border-t border-navy-light p-4">
          {userEmail ? (
            <div className="space-y-2">
              <div className="rounded-md bg-navy-light px-3 py-2">
                <p className="truncate text-sm font-medium text-silver-light">
                  {userName ?? userEmail}
                </p>
                <p className="truncate text-xs text-silver">{userEmail}</p>
              </div>
              <Link
                href={isAdmin ? "/admin" : "/account"}
                onClick={onClose}
                className="flex w-full items-center justify-center rounded-md border border-accent px-4 py-2.5 text-sm font-medium text-accent transition-colors hover:bg-accent hover:text-navy"
              >
                {isAdmin ? "Admin Dashboard" : "My Account"}
              </Link>
              <form action={signOut}>
                <button
                  type="submit"
                  className="flex w-full items-center justify-center rounded-md border border-silver px-4 py-2.5 text-sm font-medium text-silver-light transition-colors hover:bg-navy-light"
                >
                  Sign out
                </button>
              </form>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <Link
                href="/signup"
                onClick={onClose}
                className="flex w-full items-center justify-center rounded-md bg-accent px-4 py-2.5 text-sm font-medium text-navy transition-colors hover:bg-accent-dark"
              >
                Sign Up
              </Link>
              <Link
                href="/login"
                onClick={onClose}
                className="flex w-full items-center justify-center rounded-md border border-accent px-4 py-2.5 text-sm font-medium text-accent transition-colors hover:bg-accent hover:text-navy"
              >
                Login
              </Link>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
