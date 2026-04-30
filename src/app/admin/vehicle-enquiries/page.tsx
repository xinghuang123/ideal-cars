import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import StatusBadge from "@/components/admin/StatusBadge";
import StatusActions from "@/components/admin/StatusActions";
import type { EnquiryStatus } from "@/types/database";

interface VehicleEnquiryRow {
  id: string;
  vehicle_id: string | null;
  name: string;
  email: string;
  phone: string;
  message: string | null;
  status: EnquiryStatus;
  created_at: string;
  vehicles: {
    year: number;
    make: string;
    model: string;
    stock_number: string;
  } | null;
}

export default async function VehicleEnquiriesPage() {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("vehicle_enquiries")
    .select(
      "id, vehicle_id, name, email, phone, message, status, created_at, vehicles(year, make, model, stock_number)",
    )
    .order("created_at", { ascending: false });

  const enquiries = (data ?? []) as unknown as VehicleEnquiryRow[];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-navy">Vehicle Enquiries</h1>
        <p className="mt-1 text-sm text-silver-dark">
          {enquiries.length} total ·{" "}
          {enquiries.filter((e) => e.status === "new").length} new
        </p>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          Failed to load: {error.message}
        </div>
      )}

      {enquiries.length === 0 ? (
        <div className="rounded-xl border border-silver bg-white p-12 text-center text-silver-dark">
          No enquiries yet.
        </div>
      ) : (
        <ul className="space-y-3">
          {enquiries.map((e) => (
            <li
              key={e.id}
              className="rounded-xl border border-silver bg-white p-5 shadow-sm"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold text-navy">{e.name}</span>
                    <StatusBadge status={e.status} />
                  </div>
                  <p className="mt-1 text-sm text-silver-dark">
                    {e.vehicles ? (
                      <Link
                        href={`/buy/${e.vehicle_id}`}
                        target="_blank"
                        className="text-navy hover:text-accent"
                      >
                        {e.vehicles.year} {e.vehicles.make} {e.vehicles.model}{" "}
                        (Stock #{e.vehicles.stock_number})
                      </Link>
                    ) : (
                      <span className="italic">Vehicle deleted</span>
                    )}
                  </p>
                  <p className="mt-1 text-sm text-silver-dark">
                    <a
                      href={`mailto:${e.email}?subject=Re: ${e.vehicles ? `${e.vehicles.year} ${e.vehicles.make} ${e.vehicles.model}` : "your enquiry"} - Ideal Cars`}
                      className="text-accent hover:underline"
                    >
                      {e.email}
                    </a>
                    {" · "}
                    <a
                      href={`tel:${e.phone}`}
                      className="text-accent hover:underline"
                    >
                      {e.phone}
                    </a>
                  </p>
                </div>
                <span className="whitespace-nowrap text-xs text-silver-dark">
                  {new Date(e.created_at).toLocaleString("en-NZ")}
                </span>
              </div>

              {e.message && (
                <p className="mt-3 whitespace-pre-wrap rounded-lg bg-gray-50 p-3 text-sm text-navy">
                  {e.message}
                </p>
              )}

              <div className="mt-3">
                <StatusActions
                  table="vehicle_enquiries"
                  id={e.id}
                  status={e.status}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
