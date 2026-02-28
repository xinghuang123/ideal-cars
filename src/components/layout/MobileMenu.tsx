"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { cn } from "@/lib/utils";
import { navLinks } from "./Navbar";

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MobileMenu({ isOpen, onClose }: MobileMenuProps) {
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
  useEffect(() => {
    onClose();
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
              width={130}
              height={40}
              className="h-8 w-auto"
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

        {/* Login button at bottom of mobile menu */}
        <div className="absolute bottom-0 left-0 right-0 border-t border-navy-light p-4">
          <Link
            href="/login"
            onClick={onClose}
            className="flex w-full items-center justify-center rounded-md border border-accent px-4 py-2.5 text-sm font-medium text-accent transition-colors hover:bg-accent hover:text-navy"
          >
            Login
          </Link>
        </div>
      </div>
    </>
  );
}
