"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Button from "@/components/ui/Button";

export default function ThankYouCard() {
  const [firstName, setFirstName] = useState<string | null>(null);

  useEffect(() => {
    // The name is handed off from the contact form via sessionStorage so it
    // never appears in the URL. Read it once, then clear it.
    const stored = sessionStorage.getItem("contactName");
    if (stored) {
      setFirstName(stored.trim().split(/\s+/)[0]);
      sessionStorage.removeItem("contactName");
    }
  }, []);

  return (
    <div className="mx-auto max-w-xl rounded-xl border border-green-200 bg-green-50 p-8 text-center shadow-sm">
      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
        <svg
          className="h-8 w-8 text-green-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 13l4 4L19 7"
          />
        </svg>
      </div>
      <h2 className="text-2xl font-bold text-green-800">Message Sent!</h2>
      <p className="mt-2 text-green-700">
        Thank you{firstName ? `, ${firstName}` : ""}. We have received your
        message and will get back to you within one business day.
      </p>
      <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
        <Button asChild>
          <Link href="/buy">Browse our cars</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/">Back to home</Link>
        </Button>
      </div>
    </div>
  );
}
