import Link from "next/link";
import { getCurrentCustomer } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

interface ServiceRow {
  id: string;
  service_date: string;
  service_type: string;
  mileage: number | null;
  description: string | null;
  cost: number | null;
  performed_by: string | null;
  customer_vehicles: {
    id: string;
    year: number;
    make: string;
    model: string;
  } | null;
}

function fmtDate(d: string): string {
  return new Date(d).toLocaleDateString("en-NZ", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default async function ServicesPage() {
  const customer = await getCurrentCustomer();
  if (!customer) return null;

  const supabase = createClient();
  const { data, error } = await supabase
    .from("service_records")
    .select(
      "id, service_date, service_type, mileage, description, cost, performed_by, customer_vehicles!inner(id, year, make, model, customer_id)",
    )
    .eq("customer_vehicles.customer_id", customer.userId)
    .order("service_date", { ascending: false });

  const records = (data ?? []) as unknown as ServiceRow[];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-navy">Service & Repairs</h1>
        <p className="mt-1 text-sm text-silver-dark">
          Full history across all your vehicles.
        </p>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          Failed to load: {error.message}
        </div>
      )}

      {records.length === 0 ? (
        <div className="rounded-xl border border-silver bg-white p-12 text-center text-silver-dark">
          No service records yet. Once we service one of your vehicles, it&apos;ll
          appear here.
        </div>
      ) : (
        <ul className="space-y-3">
          {records.map((r) => (
            <li
              key={r.id}
              className="rounded-xl border border-silver bg-white p-5 shadow-sm"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-navy">{r.service_type}</p>
                  <p className="text-sm text-silver-dark">
                    {fmtDate(r.service_date)}
                    {r.mileage
                      ? ` · ${r.mileage.toLocaleString("en-NZ")} km`
                      : ""}
                    {r.performed_by ? ` · ${r.performed_by}` : ""}
                  </p>
                  {r.customer_vehicles && (
                    <Link
                      href={`/account/vehicles/${r.customer_vehicles.id}`}
                      className="mt-1 inline-block text-sm text-accent hover:underline"
                    >
                      {r.customer_vehicles.year} {r.customer_vehicles.make}{" "}
                      {r.customer_vehicles.model} →
                    </Link>
                  )}
                </div>
                {r.cost !== null && (
                  <p className="font-semibold text-navy">
                    ${Number(r.cost).toLocaleString("en-NZ", { minimumFractionDigits: 2 })}
                  </p>
                )}
              </div>
              {r.description && (
                <p className="mt-3 whitespace-pre-wrap text-sm text-navy">
                  {r.description}
                </p>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
