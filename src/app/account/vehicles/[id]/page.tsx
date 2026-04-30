import Link from "next/link";
import { notFound } from "next/navigation";
import { getCurrentCustomer } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

interface CustomerVehicle {
  id: string;
  year: number;
  make: string;
  model: string;
  rego: string | null;
  vin: string | null;
  colour: string | null;
  purchased_from_dealer: boolean;
  purchase_date: string | null;
  last_service_date: string | null;
  last_service_mileage: number | null;
  next_service_due_date: string | null;
  last_wof_date: string | null;
  next_wof_due_date: string | null;
  rego_expiry_date: string | null;
  notes: string | null;
}

interface ServiceRecord {
  id: string;
  service_date: string;
  service_type: string;
  mileage: number | null;
  description: string | null;
  cost: number | null;
  performed_by: string | null;
}

function fmtDate(d: string | null): string {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-NZ", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default async function VehicleDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const customer = await getCurrentCustomer();
  if (!customer) return null;

  const supabase = createClient();
  const { data: vehicle } = await supabase
    .from("customer_vehicles")
    .select("*")
    .eq("id", params.id)
    .eq("customer_id", customer.userId)
    .maybeSingle();

  if (!vehicle) notFound();
  const v = vehicle as CustomerVehicle;

  const { data: services } = await supabase
    .from("service_records")
    .select("id, service_date, service_type, mileage, description, cost, performed_by")
    .eq("customer_vehicle_id", params.id)
    .order("service_date", { ascending: false });

  const records = (services ?? []) as ServiceRecord[];

  return (
    <div className="space-y-6">
      <div>
        <Link href="/account/vehicles" className="text-sm text-silver-dark hover:text-accent">
          ← Back to my vehicles
        </Link>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <h1 className="text-2xl font-bold text-navy">
            {v.year} {v.make} {v.model}
          </h1>
          {v.purchased_from_dealer && (
            <span className="rounded-full bg-accent/10 px-2 py-0.5 text-xs font-semibold text-accent">
              Bought from us
            </span>
          )}
        </div>
        <p className="mt-1 text-sm text-silver-dark">
          {[v.colour, v.rego ? `Rego: ${v.rego}` : null, v.vin ? `VIN: ${v.vin}` : null]
            .filter(Boolean)
            .join(" · ")}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-silver bg-white p-4">
          <p className="text-xs uppercase tracking-wide text-silver-dark">Next service</p>
          <p className="mt-1 text-lg font-semibold text-navy">{fmtDate(v.next_service_due_date)}</p>
          {v.last_service_date && (
            <p className="mt-1 text-xs text-silver-dark">
              Last: {fmtDate(v.last_service_date)}
              {v.last_service_mileage ? ` · ${v.last_service_mileage.toLocaleString("en-NZ")} km` : ""}
            </p>
          )}
        </div>
        <div className="rounded-xl border border-silver bg-white p-4">
          <p className="text-xs uppercase tracking-wide text-silver-dark">WoF expires</p>
          <p className="mt-1 text-lg font-semibold text-navy">{fmtDate(v.next_wof_due_date)}</p>
          {v.last_wof_date && (
            <p className="mt-1 text-xs text-silver-dark">Last issued: {fmtDate(v.last_wof_date)}</p>
          )}
        </div>
        <div className="rounded-xl border border-silver bg-white p-4">
          <p className="text-xs uppercase tracking-wide text-silver-dark">Rego expires</p>
          <p className="mt-1 text-lg font-semibold text-navy">{fmtDate(v.rego_expiry_date)}</p>
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Link
          href={`/account/vehicles/${v.id}/edit`}
          className="rounded-md border border-silver px-4 py-2 text-sm font-medium text-navy hover:bg-gray-50"
        >
          Edit details
        </Link>
      </div>

      <div>
        <h2 className="mb-3 text-lg font-semibold text-navy">Service history</h2>
        {records.length === 0 ? (
          <div className="rounded-xl border border-silver bg-white p-8 text-center text-sm text-silver-dark">
            No service records yet. Once we service this vehicle, the records will
            appear here.
          </div>
        ) : (
          <ul className="space-y-2">
            {records.map((r) => (
              <li
                key={r.id}
                className="rounded-lg border border-silver bg-white p-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-navy">{r.service_type}</p>
                    <p className="text-sm text-silver-dark">
                      {fmtDate(r.service_date)}
                      {r.mileage ? ` · ${r.mileage.toLocaleString("en-NZ")} km` : ""}
                      {r.performed_by ? ` · ${r.performed_by}` : ""}
                    </p>
                  </div>
                  {r.cost !== null && (
                    <p className="font-semibold text-navy">
                      ${Number(r.cost).toLocaleString("en-NZ", { minimumFractionDigits: 2 })}
                    </p>
                  )}
                </div>
                {r.description && (
                  <p className="mt-2 whitespace-pre-wrap text-sm text-navy">{r.description}</p>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      {v.notes && (
        <div className="rounded-xl border border-silver bg-white p-5">
          <h3 className="mb-2 text-sm font-semibold text-navy">Notes</h3>
          <p className="whitespace-pre-wrap text-sm text-navy">{v.notes}</p>
        </div>
      )}
    </div>
  );
}
