import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import StatusBadge from "@/components/admin/StatusBadge";
import type { EnquiryStatus } from "@/types/database";
import AssignVehicleForm from "./AssignVehicleForm";
import AddServiceForm from "./AddServiceForm";
import AddRepairForm from "./AddRepairForm";

export const dynamic = "force-dynamic";

interface CustomerProfile {
  id: string;
  full_name: string | null;
  phone: string | null;
  address_line1: string | null;
  address_line2: string | null;
  city: string | null;
  region: string | null;
  postcode: string | null;
  created_at: string;
}

interface ServiceRecord {
  id: string;
  record_type: "service" | "repair";
  service_date: string;
  service_type: string;
  mileage: number | null;
  description: string | null;
  cost: number | null;
  next_service_due_date: string | null;
  performed_by: string | null;
  diagnosis: string | null;
  work_done: string | null;
  parts_cost: number | null;
  labour_cost: number | null;
  warranty_until: string | null;
}

interface CustomerVehicle {
  id: string;
  year: number;
  make: string;
  model: string;
  rego: string | null;
  vin: string | null;
  colour: string | null;
  purchase_date: string | null;
  purchased_from_dealer: boolean;
  last_service_date: string | null;
  next_service_due_date: string | null;
  next_wof_due_date: string | null;
  rego_expiry_date: string | null;
  notes: string | null;
  service_records: ServiceRecord[];
}

interface EmbeddedVehicle {
  year: number;
  make: string;
  model: string;
  stock_number: string | null;
}

interface FinanceApp {
  id: string;
  status: EnquiryStatus;
  employment_status: string | null;
  annual_income: number | null;
  deposit_amount: number | null;
  loan_term_years: number | null;
  message: string | null;
  created_at: string;
  vehicles: EmbeddedVehicle | null;
}

interface VehicleEnquiry {
  id: string;
  message: string | null;
  status: EnquiryStatus;
  created_at: string;
  vehicles: EmbeddedVehicle | null;
}

interface AvailableVehicle {
  id: string;
  year: number;
  make: string;
  model: string;
  stock_number: string | null;
}

function fmtAddress(p: CustomerProfile): string {
  const parts = [
    p.address_line1,
    p.address_line2,
    p.city,
    p.region,
    p.postcode,
  ].filter(Boolean);
  return parts.length ? parts.join(", ") : "—";
}

function fmtDate(d: string | null): string {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-NZ", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function fmtCurrency(n: number | null): string {
  if (n === null || n === undefined) return "—";
  return `$${Number(n).toLocaleString("en-NZ")}`;
}

/** Days from today until the date; negative = overdue. */
function daysUntil(d: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.round(
    (new Date(d).getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
  );
}

function DueDate({ label, date }: { label: string; date: string | null }) {
  if (!date) {
    return (
      <span className="text-xs text-silver-dark">
        {label}: <span className="text-navy">—</span>
      </span>
    );
  }
  const days = daysUntil(date);
  const tone =
    days < 0
      ? "bg-red-100 text-red-800"
      : days <= 30
        ? "bg-amber-100 text-amber-800"
        : "bg-gray-100 text-gray-700";
  const note = days < 0 ? "overdue" : days <= 30 ? `${days}d` : null;
  return (
    <span className="text-xs text-silver-dark">
      {label}:{" "}
      <span
        className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-medium ${tone}`}
      >
        {fmtDate(date)}
        {note ? ` · ${note}` : ""}
      </span>
    </span>
  );
}

function StatChip({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-lg border border-silver bg-white px-4 py-2 text-center">
      <p className="text-lg font-bold text-navy">{value}</p>
      <p className="text-xs text-silver-dark">{label}</p>
    </div>
  );
}

export default async function CustomerDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createClient();

  const { data: profile } = await supabase
    .from("customer_profiles")
    .select("*")
    .eq("id", params.id)
    .maybeSingle();
  if (!profile) notFound();
  const p = profile as CustomerProfile;

  let email = "";
  let lastSignIn: string | null = null;
  try {
    const admin = createAdminClient();
    const { data } = await admin.auth.admin.getUserById(params.id);
    email = data.user?.email ?? "";
    lastSignIn = data.user?.last_sign_in_at ?? null;
  } catch {
    /* noop */
  }

  const [vehiclesRes, availableRes, financeRes, enquiriesRes, newsletterRes] =
    await Promise.all([
      supabase
        .from("customer_vehicles")
        .select(
          `id, year, make, model, rego, vin, colour, purchase_date,
           purchased_from_dealer, last_service_date, next_service_due_date,
           next_wof_due_date, rego_expiry_date, notes,
           service_records(id, record_type, service_date, service_type, mileage,
             description, cost, next_service_due_date, performed_by, diagnosis,
             work_done, parts_cost, labour_cost, warranty_until)`,
        )
        .eq("customer_id", params.id)
        .order("created_at", { ascending: false })
        .order("service_date", {
          referencedTable: "service_records",
          ascending: false,
        }),
      supabase
        .from("vehicles")
        .select("id, year, make, model, stock_number")
        .neq("status", "sold")
        .order("created_at", { ascending: false })
        .limit(200),
      supabase
        .from("finance_applications")
        .select(
          "id, status, employment_status, annual_income, deposit_amount, loan_term_years, message, created_at, vehicles(year, make, model, stock_number)",
        )
        .eq("customer_id", params.id)
        .order("created_at", { ascending: false }),
      supabase
        .from("vehicle_enquiries")
        .select(
          "id, message, status, created_at, vehicles(year, make, model, stock_number)",
        )
        .eq("customer_id", params.id)
        .order("created_at", { ascending: false }),
      email
        ? supabase
            .from("newsletter_subscribers")
            .select("is_active")
            .eq("email", email)
            .maybeSingle()
        : Promise.resolve({ data: null }),
    ]);

  const vehicles = (vehiclesRes.data ?? []) as unknown as CustomerVehicle[];
  const available = (availableRes.data ?? []) as AvailableVehicle[];
  const financeApps = (financeRes.data ?? []) as unknown as FinanceApp[];
  const enquiries = (enquiriesRes.data ?? []) as unknown as VehicleEnquiry[];
  const newsletter = newsletterRes.data as { is_active: boolean } | null;

  const totalSpend = vehicles
    .flatMap((v) => v.service_records)
    .reduce((sum, r) => sum + (r.cost ? Number(r.cost) : 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Link
          href="/admin/customers"
          className="text-sm text-silver-dark hover:text-accent"
        >
          ← Back to customers
        </Link>
        <div className="mt-2 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-navy">
              {p.full_name || "(no name set)"}
            </h1>
            <p className="mt-1 text-sm text-silver-dark">
              {email ? (
                <a
                  href={`mailto:${email}`}
                  className="text-accent hover:underline"
                >
                  {email}
                </a>
              ) : (
                "(no email)"
              )}
              {p.phone && (
                <>
                  {" · "}
                  <a
                    href={`tel:${p.phone}`}
                    className="text-accent hover:underline"
                  >
                    {p.phone}
                  </a>
                </>
              )}
            </p>
            <p className="mt-1 text-xs text-silver-dark">
              Joined {fmtDate(p.created_at)}
              {lastSignIn ? ` · Last sign-in ${fmtDate(lastSignIn)}` : ""}
              {" · Newsletter: "}
              <span className="font-medium text-navy">
                {newsletter
                  ? newsletter.is_active
                    ? "subscribed"
                    : "unsubscribed"
                  : "not subscribed"}
              </span>
            </p>
          </div>
          <div className="flex gap-3">
            <StatChip label="Vehicles" value={vehicles.length} />
            <StatChip label="Finance apps" value={financeApps.length} />
            <StatChip label="Enquiries" value={enquiries.length} />
            <StatChip label="Service spend" value={fmtCurrency(totalSpend)} />
          </div>
        </div>
      </div>

      {/* Address */}
      <div className="rounded-xl border border-silver bg-white p-5">
        <h2 className="mb-2 text-sm font-semibold text-navy">Address</h2>
        <p className="text-sm text-navy">{fmtAddress(p)}</p>
      </div>

      {/* Vehicles */}
      <div className="rounded-xl border border-silver bg-white p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-navy">Vehicles</h2>
          <span className="text-sm text-silver-dark">
            {vehicles.length} total
          </span>
        </div>

        {vehicles.length === 0 ? (
          <p className="text-sm text-silver-dark">No vehicles assigned yet.</p>
        ) : (
          <ul className="space-y-3">
            {vehicles.map((v) => (
              <li key={v.id} className="rounded-lg border border-silver p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-navy">
                      {v.year} {v.make} {v.model}
                    </p>
                    <p className="text-sm text-silver-dark">
                      {[
                        v.colour,
                        v.rego ? `Rego: ${v.rego}` : null,
                        v.vin ? `VIN: ${v.vin}` : null,
                        v.purchased_from_dealer
                          ? `Bought from us${v.purchase_date ? ` ${fmtDate(v.purchase_date)}` : ""}`
                          : "Customer-added",
                      ]
                        .filter(Boolean)
                        .join(" · ")}
                    </p>
                    {v.notes && (
                      <p className="mt-1 text-xs italic text-silver-dark">
                        {v.notes}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <DueDate label="Next service" date={v.next_service_due_date} />
                    <DueDate label="WoF due" date={v.next_wof_due_date} />
                    <DueDate label="Rego expires" date={v.rego_expiry_date} />
                  </div>
                </div>

                {v.service_records.length > 0 && (
                  <div className="mt-4 border-t border-silver/60 pt-3">
                    <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-silver-dark">
                      Service &amp; repair history ({v.service_records.length})
                    </h3>
                    <ul className="space-y-2">
                      {v.service_records.map((r) => (
                        <li
                          key={r.id}
                          className="rounded-md bg-gray-50 px-3 py-2 text-sm"
                        >
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <span className="font-medium text-navy">
                              <span
                                className={`mr-2 inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${
                                  r.record_type === "repair"
                                    ? "bg-orange-100 text-orange-800"
                                    : "bg-sky-100 text-sky-800"
                                }`}
                              >
                                {r.record_type}
                              </span>
                              {r.service_type}
                            </span>
                            <span className="text-xs text-silver-dark">
                              {fmtDate(r.service_date)}
                              {r.mileage
                                ? ` · ${r.mileage.toLocaleString("en-NZ")} km`
                                : ""}
                              {r.cost !== null
                                ? ` · ${fmtCurrency(r.cost)}`
                                : ""}
                            </span>
                          </div>
                          {(r.description || r.diagnosis || r.work_done) && (
                            <p className="mt-1 text-xs text-silver-dark">
                              {[r.diagnosis, r.work_done, r.description]
                                .filter(Boolean)
                                .join(" — ")}
                            </p>
                          )}
                          {(r.performed_by || r.warranty_until) && (
                            <p className="mt-0.5 text-xs text-silver-dark">
                              {[
                                r.performed_by ? `By ${r.performed_by}` : null,
                                r.warranty_until
                                  ? `Warranty until ${fmtDate(r.warranty_until)}`
                                  : null,
                              ]
                                .filter(Boolean)
                                .join(" · ")}
                            </p>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="mt-3 flex flex-wrap gap-4">
                  <AddServiceForm customerVehicleId={v.id} />
                  <AddRepairForm customerVehicleId={v.id} />
                </div>
              </li>
            ))}
          </ul>
        )}

        <div className="mt-6 border-t border-silver pt-5">
          <h3 className="mb-3 text-sm font-semibold text-navy">
            Add a vehicle to this customer
          </h3>
          <AssignVehicleForm
            customerId={params.id}
            availableVehicles={available}
          />
        </div>
      </div>

      {/* Finance applications */}
      <div className="rounded-xl border border-silver bg-white p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-navy">
            Finance applications
          </h2>
          <Link
            href="/admin/finance"
            className="text-sm text-accent hover:underline"
          >
            View all finance →
          </Link>
        </div>
        {financeApps.length === 0 ? (
          <p className="text-sm text-silver-dark">
            No finance applications from this customer.
          </p>
        ) : (
          <ul className="space-y-3">
            {financeApps.map((a) => (
              <li key={a.id} className="rounded-lg border border-silver p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-medium text-navy">
                    {a.vehicles
                      ? `${a.vehicles.year} ${a.vehicles.make} ${a.vehicles.model}${a.vehicles.stock_number ? ` (#${a.vehicles.stock_number})` : ""}`
                      : "General application"}
                  </p>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={a.status} />
                    <span className="text-xs text-silver-dark">
                      {fmtDate(a.created_at)}
                    </span>
                  </div>
                </div>
                <p className="mt-1 text-sm text-silver-dark">
                  {[
                    a.employment_status,
                    a.annual_income !== null
                      ? `Income ${fmtCurrency(a.annual_income)}/yr`
                      : null,
                    a.deposit_amount !== null
                      ? `Deposit ${fmtCurrency(a.deposit_amount)}`
                      : null,
                    a.loan_term_years
                      ? `${a.loan_term_years} year term`
                      : null,
                  ]
                    .filter(Boolean)
                    .join(" · ") || "—"}
                </p>
                {a.message && (
                  <p className="mt-1 text-xs italic text-silver-dark">
                    “{a.message}”
                  </p>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Vehicle enquiries */}
      <div className="rounded-xl border border-silver bg-white p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-navy">Vehicle enquiries</h2>
          <Link
            href="/admin/vehicle-enquiries"
            className="text-sm text-accent hover:underline"
          >
            View all enquiries →
          </Link>
        </div>
        {enquiries.length === 0 ? (
          <p className="text-sm text-silver-dark">
            No vehicle enquiries from this customer.
          </p>
        ) : (
          <ul className="space-y-3">
            {enquiries.map((e) => (
              <li key={e.id} className="rounded-lg border border-silver p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-medium text-navy">
                    {e.vehicles
                      ? `${e.vehicles.year} ${e.vehicles.make} ${e.vehicles.model}${e.vehicles.stock_number ? ` (#${e.vehicles.stock_number})` : ""}`
                      : "(vehicle no longer listed)"}
                  </p>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={e.status} />
                    <span className="text-xs text-silver-dark">
                      {fmtDate(e.created_at)}
                    </span>
                  </div>
                </div>
                {e.message && (
                  <p className="mt-1 text-sm text-silver-dark">{e.message}</p>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
