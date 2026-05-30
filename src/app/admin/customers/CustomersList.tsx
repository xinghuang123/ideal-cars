"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

export interface CustomerListItem {
  id: string;
  full_name: string | null;
  email: string;
  phone: string | null;
  city: string | null;
  region: string | null;
  created_at: string;
  vehicleCount: number;
}

export default function CustomersList({
  customers,
}: {
  customers: CustomerListItem[];
}) {
  const [query, setQuery] = useState("");
  const [copied, setCopied] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return customers;
    return customers.filter((c) =>
      [c.full_name, c.email, c.phone, c.city, c.region]
        .filter(Boolean)
        .some((field) => field!.toLowerCase().includes(q)),
    );
  }, [customers, query]);

  const emailList = useMemo(
    () =>
      filtered
        .map((c) => c.email)
        .filter(Boolean)
        .join(", "),
    [filtered],
  );

  async function copyEmails() {
    if (!emailList) return;
    try {
      await navigator.clipboard.writeText(emailList);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Clipboard API can be blocked; fall back to a prompt the user can copy from.
      window.prompt("Copy the customer emails below:", emailList);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, email, phone, or location…"
            className="w-full rounded-lg border border-silver bg-white px-4 py-2.5 text-sm text-navy focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30"
          />
        </div>
        <button
          type="button"
          onClick={copyEmails}
          disabled={filtered.length === 0}
          className="whitespace-nowrap rounded-lg border border-accent bg-accent/10 px-4 py-2.5 text-sm font-medium text-navy hover:bg-accent/20 disabled:opacity-50"
          title="Copy all shown emails, comma-separated, for pasting into Gmail"
        >
          {copied
            ? "Copied!"
            : `Export ${filtered.length} email${filtered.length === 1 ? "" : "s"}`}
        </button>
      </div>

      <p className="text-xs text-silver-dark">
        Showing {filtered.length} of {customers.length} customer
        {customers.length === 1 ? "" : "s"}
        {query.trim() ? ` matching “${query.trim()}”` : ""}.
      </p>

      {filtered.length === 0 ? (
        <div className="rounded-xl border border-silver bg-white p-12 text-center text-silver-dark">
          No customers match your search.
        </div>
      ) : (
        <ul className="space-y-3">
          {filtered.map((c) => (
            <li
              key={c.id}
              className="rounded-xl border border-silver bg-white p-5 shadow-sm"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <Link
                    href={`/admin/customers/${c.id}`}
                    className="text-lg font-semibold text-navy hover:text-accent"
                  >
                    {c.full_name || "(no name set)"}
                  </Link>
                  <p className="mt-1 text-sm text-silver-dark">
                    {c.email ? (
                      <a
                        href={`mailto:${c.email}`}
                        className="text-accent hover:underline"
                      >
                        {c.email}
                      </a>
                    ) : (
                      "(no email)"
                    )}{" "}
                    {c.phone && (
                      <>
                        ·{" "}
                        <a
                          href={`tel:${c.phone}`}
                          className="text-accent hover:underline"
                        >
                          {c.phone}
                        </a>
                      </>
                    )}
                  </p>
                  <p className="mt-1 text-xs text-silver-dark">
                    {[c.city, c.region].filter(Boolean).join(", ") || "—"} ·{" "}
                    {c.vehicleCount} vehicle{c.vehicleCount === 1 ? "" : "s"}
                  </p>
                </div>
                <span className="whitespace-nowrap text-xs text-silver-dark">
                  Joined {new Date(c.created_at).toLocaleDateString("en-NZ")}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
