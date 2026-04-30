import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

interface CustomerRow {
  id: string;
  full_name: string | null;
  phone: string | null;
  city: string | null;
  region: string | null;
  created_at: string;
  customer_vehicles: { count: number }[];
}

export default async function CustomersPage() {
  const supabase = createClient();

  const { data: profiles, error } = await supabase
    .from("customer_profiles")
    .select(
      "id, full_name, phone, city, region, created_at, customer_vehicles(count)",
    )
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Failed to load customers", error);
  }

  // Pull auth.users emails via the admin schema (RLS-bypassing).
  let emailById: Record<string, string> = {};
  try {
    const { createAdminClient } = await import("@/lib/supabase/admin");
    const admin = createAdminClient();
    const { data } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
    emailById = Object.fromEntries(
      (data?.users ?? [])
        .filter(
          (u) =>
            (u.app_metadata as Record<string, unknown> | undefined)?.role !==
            "admin",
        )
        .map((u) => [u.id, u.email ?? ""] as [string, string]),
    );
  } catch (e) {
    console.error("Failed to load auth users", e);
  }

  const rows = (profiles ?? []) as CustomerRow[];
  const hasError = Boolean(error);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-navy">Customers</h1>
        <p className="mt-1 text-sm text-silver-dark">
          {hasError
            ? "Couldn't load the customer list."
            : `${rows.length} registered customer${rows.length === 1 ? "" : "s"}`}
        </p>
      </div>

      {hasError ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-sm text-red-800">
          <p className="font-semibold">Something went wrong loading customers.</p>
          <p className="mt-1">
            Please refresh the page in a moment. If the problem persists, check
            the server logs.
          </p>
        </div>
      ) : rows.length === 0 ? (
        <div className="rounded-xl border border-silver bg-white p-12 text-center text-silver-dark">
          No customers yet. Customers appear here after they sign up.
        </div>
      ) : (
        <ul className="space-y-3">
          {rows.map((c) => (
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
                    {emailById[c.id] || "(no email)"}{" "}
                    {c.phone && (
                      <>
                        ·{" "}
                        <a href={`tel:${c.phone}`} className="text-accent hover:underline">
                          {c.phone}
                        </a>
                      </>
                    )}
                  </p>
                  <p className="mt-1 text-xs text-silver-dark">
                    {[c.city, c.region].filter(Boolean).join(", ") || "—"} ·{" "}
                    {c.customer_vehicles?.[0]?.count ?? 0} vehicle
                    {(c.customer_vehicles?.[0]?.count ?? 0) === 1 ? "" : "s"}
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
