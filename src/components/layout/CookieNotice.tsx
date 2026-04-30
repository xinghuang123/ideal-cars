"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const STORAGE_KEY = "idealcars-cookie-notice-dismissed";

export default function CookieNotice() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!window.localStorage.getItem(STORAGE_KEY)) {
      setVisible(true);
    }
  }, []);

  function dismiss() {
    try {
      window.localStorage.setItem(STORAGE_KEY, "1");
    } catch {
      // localStorage may be disabled in private mode — fail silently
    }
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div
      role="region"
      aria-label="Cookie notice"
      className="fixed bottom-0 left-0 right-0 z-40 border-t border-silver bg-white shadow-lg"
    >
      <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-3 text-sm sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
        <p className="text-silver-dark">
          We use essential cookies to make this site work and basic analytics to
          improve it. By continuing to browse, you agree to our use of cookies.{" "}
          <Link href="/privacy" className="text-accent hover:underline">
            Read our Privacy Policy
          </Link>
          .
        </p>
        <button
          onClick={dismiss}
          className="shrink-0 rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-accent-dark"
        >
          Got it
        </button>
      </div>
    </div>
  );
}
