import Link from "next/link";
import { getCurrentCustomer } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

interface VehicleRow {
  id: string;
  year: number;
  make: string;
  model: string;
  rego: string | null;
  colour: string | null;
  purchased_from_dealer: boolean;
  next_service_due_date: string | null;
  next_wof_due_date: string | null;
  rego_expiry_date: string | null;
}

function formatDate(d: string | null): string {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-NZ", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function dueClass(d: string | null): string {
  if (!d) return "text-silver-dark";
  const days = Math.round(
    (new Date(d).getTime() - Date.now()) / (1000 * 60 * 60 * 24),
  );
  if (days < 0) return "text-red-600 font-medium";
  if (days <= 30) return "text-orange-600 font-medium";
  return "text-navy";
}

export default async function VehiclesPage() {
  const customer = await getCurrentCustomer();
  if (!customer) return null;

  const supabase = createClient();
  const { data, error } = await supabase
    .from("customer_vehicles")
    .select(
      "id, year, make, model, rego, colour, purchased_from_dealer, next_service_due_date, next_wof_due_date, rego_expiry_date",
    )
    .eq("customer_id", customer.userId)
    .order("created_at", { ascending: false });

  const vehicles = (data ?? []) as VehicleRow[];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-navy">Car Profile</h1>
          <p className="mt-1 text-sm text-silver-dark">
            Vehicles you own — bought from us or elsewhere.
          </p>
        </div>
        <Link
          href="/account/vehicles/new"
          className="inline-flex items-center rounded-md bg-accent px-4 py-2 text-sm font-medium text-navy hover:bg-accent-dark"
        >
          + Add vehicle
        </Link>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          Failed to load: {error.message}
        </div>
      )}

      {vehicles.length === 0 ? (
        <div className="rounded-xl border border-silver bg-white p-12 text-center">
          <p className="text-silver-dark">
            You haven&apos;t added any vehicles yet.
          </p>
          <Link
            href="/account/vehicles/new"
            className="mt-4 inline-flex items-center rounded-md bg-accent px-4 py-2 text-sm font-medium text-navy hover:bg-accent-dark"
          >
            Add your first vehicle
          </Link>
        </div>
      ) : (
        <ul className="space-y-3">
          {vehicles.map((v) => (
            <li
              key={v.id}
              className="rounded-xl border border-silver bg-white p-5 shadow-sm"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/account/vehicles/${v.id}`}
                      className="text-lg font-semibold text-navy hover:text-accent"
                    >
                      {v.year} {v.make} {v.model}
                    </Link>
                    {v.purchased_from_dealer && (
                      <span className="rounded-full bg-accent/10 px-2 py-0.5 text-xs font-semibold text-accent">
                        Bought from us
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-silver-dark">
                    {[v.colour, v.rego ? `Rego: ${v.rego}` : null]
                      .filter(Boolean)
                      .join(" · ") || "No additional details"}
                  </p>
                </div>
                <Link
                  href={`/account/vehicles/${v.id}`}
                  className="text-sm font-medium text-accent hover:underline"
                >
                  View →
                </Link>
              </div>
              <div className="mt-4 grid grid-cols-1 gap-2 text-xs sm:grid-cols-3">
                <div>
                  <p className="text-silver-dark">Next service</p>
                  <p className={dueClass(v.next_service_due_date)}>
                    {formatDate(v.next_service_due_date)}
                  </p>
                </div>
                <div>
                  <p className="text-silver-dark">WoF expires</p>
                  <p className={dueClass(v.next_wof_due_date)}>
                    {formatDate(v.next_wof_due_date)}
                  </p>
                </div>
                <div>
                  <p className="text-silver-dark">Rego expires</p>
                  <p className={dueClass(v.rego_expiry_date)}>
                    {formatDate(v.rego_expiry_date)}
                  </p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
