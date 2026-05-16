import Link from "next/link";
import { getCurrentCustomer } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

interface ServiceRow {
  id: string;
  record_type: "service" | "repair";
  service_date: string;
  service_type: string;
  mileage: number | null;
  description: string | null;
  cost: number | null;
  parts_cost: number | null;
  labour_cost: number | null;
  diagnosis: string | null;
  work_done: string | null;
  warranty_until: string | null;
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

function fmtMoney(n: number): string {
  return `$${Number(n).toLocaleString("en-NZ", { minimumFractionDigits: 2 })}`;
}

export default async function ServicesPage() {
  const customer = await getCurrentCustomer();
  if (!customer) return null;

  const supabase = createClient();
  const { data, error } = await supabase
    .from("service_records")
    .select(
      "id, record_type, service_date, service_type, mileage, description, cost, parts_cost, labour_cost, diagnosis, work_done, warranty_until, performed_by, customer_vehicles!inner(id, year, make, model, customer_id)",
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
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span
                      className={`rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
                        r.record_type === "repair"
                          ? "bg-red-50 text-red-700 border border-red-200"
                          : "bg-accent/10 text-accent border border-accent/30"
                      }`}
                    >
                      {r.record_type === "repair" ? "Repair" : "Service"}
                    </span>
                    <p className="font-semibold text-navy">{r.service_type}</p>
                  </div>
                  <p className="mt-1 text-sm text-silver-dark">
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
                  <p className="font-semibold text-navy">{fmtMoney(r.cost)}</p>
                )}
              </div>

              {r.record_type === "repair" ? (
                <div className="mt-3 space-y-2 text-sm text-navy">
                  {r.diagnosis && (
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-silver-dark">
                        Diagnosis
                      </p>
                      <p className="whitespace-pre-wrap">{r.diagnosis}</p>
                    </div>
                  )}
                  {r.work_done && (
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-silver-dark">
                        Work done
                      </p>
                      <p className="whitespace-pre-wrap">{r.work_done}</p>
                    </div>
                  )}
                  {(r.parts_cost !== null || r.labour_cost !== null) && (
                    <p className="text-sm text-silver-dark">
                      {r.parts_cost !== null
                        ? `Parts: ${fmtMoney(r.parts_cost)}`
                        : ""}
                      {r.parts_cost !== null && r.labour_cost !== null
                        ? " · "
                        : ""}
                      {r.labour_cost !== null
                        ? `Labour: ${fmtMoney(r.labour_cost)}`
                        : ""}
                    </p>
                  )}
                  {r.warranty_until && (
                    <p className="text-sm text-silver-dark">
                      Warranty until{" "}
                      <span className="font-medium text-navy">
                        {fmtDate(r.warranty_until)}
                      </span>
                    </p>
                  )}
                </div>
              ) : (
                r.description && (
                  <p className="mt-3 whitespace-pre-wrap text-sm text-navy">
                    {r.description}
                  </p>
                )
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
