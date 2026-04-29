import { createClient } from "@/lib/supabase/server";
import StatusBadge from "@/components/admin/StatusBadge";
import StatusActions from "@/components/admin/StatusActions";
import { formatPrice, formatMileage } from "@/lib/utils";
import type {
  EnquiryStatus,
  FuelType,
  TransmissionType,
  SellCondition,
} from "@/types/database";

interface SellCarRow {
  id: string;
  name: string;
  email: string;
  phone: string;
  make: string;
  model: string;
  year: number;
  mileage: number;
  fuel_type: FuelType;
  transmission: TransmissionType;
  condition: SellCondition;
  description: string | null;
  expected_price: number | null;
  status: EnquiryStatus;
  created_at: string;
}

export default async function SellRequestsPage() {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("sell_car_enquiries")
    .select("*")
    .order("created_at", { ascending: false });

  const requests = (data ?? []) as SellCarRow[];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-navy">Sell Car Requests</h1>
        <p className="mt-1 text-sm text-silver-dark">
          {requests.length} total · {requests.filter((r) => r.status === "new").length} new
        </p>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          Failed to load: {error.message}
        </div>
      )}

      {requests.length === 0 ? (
        <div className="rounded-xl border border-silver bg-white p-12 text-center text-silver-dark">
          No sell requests yet.
        </div>
      ) : (
        <ul className="space-y-3">
          {requests.map((r) => (
            <li
              key={r.id}
              className="rounded-xl border border-silver bg-white p-5 shadow-sm"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold text-navy">
                      {r.year} {r.make} {r.model}
                    </span>
                    <StatusBadge status={r.status} />
                  </div>
                  <p className="mt-1 text-sm text-silver-dark">
                    {formatMileage(r.mileage)} · {r.fuel_type} · {r.transmission} · Condition: {r.condition}
                    {r.expected_price && (
                      <> · Expected: {formatPrice(r.expected_price)}</>
                    )}
                  </p>
                  <p className="mt-1 text-sm">
                    <span className="font-medium text-navy">{r.name}</span>
                    {" · "}
                    <a
                      href={`mailto:${r.email}?subject=Your ${r.year} ${r.make} ${r.model} - Ideal Cars`}
                      className="text-accent hover:underline"
                    >
                      {r.email}
                    </a>
                    {" · "}
                    <a href={`tel:${r.phone}`} className="text-accent hover:underline">
                      {r.phone}
                    </a>
                  </p>
                </div>
                <span className="whitespace-nowrap text-xs text-silver-dark">
                  {new Date(r.created_at).toLocaleString("en-NZ")}
                </span>
              </div>

              {r.description && (
                <p className="mt-3 whitespace-pre-wrap rounded-lg bg-gray-50 p-3 text-sm text-navy">
                  {r.description}
                </p>
              )}

              <div className="mt-3">
                <StatusActions table="sell_car_enquiries" id={r.id} status={r.status} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
