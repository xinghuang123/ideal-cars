import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import AssignVehicleForm from "./AssignVehicleForm";
import AddServiceForm from "./AddServiceForm";

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

interface CustomerVehicle {
  id: string;
  year: number;
  make: string;
  model: string;
  rego: string | null;
  colour: string | null;
  purchased_from_dealer: boolean;
  next_service_due_date: string | null;
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

  let email = "";
  try {
    const admin = createAdminClient();
    const { data } = await admin.auth.admin.getUserById(params.id);
    email = data.user?.email ?? "";
  } catch {
    /* noop */
  }

  const [vehiclesRes, availableRes] = await Promise.all([
    supabase
      .from("customer_vehicles")
      .select(
        "id, year, make, model, rego, colour, purchased_from_dealer, next_service_due_date",
      )
      .eq("customer_id", params.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("vehicles")
      .select("id, year, make, model, stock_number")
      .neq("status", "sold")
      .order("created_at", { ascending: false })
      .limit(200),
  ]);

  const vehicles = (vehiclesRes.data ?? []) as CustomerVehicle[];
  const available = (availableRes.data ?? []) as AvailableVehicle[];
  const p = profile as CustomerProfile;

  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin/customers" className="text-sm text-silver-dark hover:text-accent">
          ← Back to customers
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-navy">
          {p.full_name || "(no name set)"}
        </h1>
        <p className="mt-1 text-sm text-silver-dark">
          {email || "(no email)"}
          {p.phone ? ` · ${p.phone}` : ""}
        </p>
      </div>

      <div className="rounded-xl border border-silver bg-white p-5">
        <h2 className="mb-2 text-sm font-semibold text-navy">Address</h2>
        <p className="text-sm text-navy">{fmtAddress(p)}</p>
      </div>

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
              <li
                key={v.id}
                className="rounded-lg border border-silver p-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-navy">
                      {v.year} {v.make} {v.model}
                    </p>
                    <p className="text-sm text-silver-dark">
                      {[
                        v.colour,
                        v.rego ? `Rego: ${v.rego}` : null,
                        v.purchased_from_dealer ? "Bought from us" : "Customer-added",
                      ]
                        .filter(Boolean)
                        .join(" · ")}
                    </p>
                  </div>
                  {v.next_service_due_date && (
                    <p className="text-xs text-silver-dark">
                      Next service:{" "}
                      <span className="font-medium text-navy">
                        {new Date(v.next_service_due_date).toLocaleDateString(
                          "en-NZ",
                        )}
                      </span>
                    </p>
                  )}
                </div>
                <div className="mt-3">
                  <AddServiceForm customerVehicleId={v.id} />
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
    </div>
  );
}
