import Link from "next/link";
import { notFound } from "next/navigation";
import { getCurrentCustomer } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import VehicleForm, { type VehicleFormValues } from "../../VehicleForm";

export const dynamic = "force-dynamic";

interface CustomerVehicle {
  id: string;
  year: number;
  make: string;
  model: string;
  rego: string | null;
  vin: string | null;
  colour: string | null;
  purchase_date: string | null;
  last_service_date: string | null;
  last_service_mileage: number | null;
  next_service_due_date: string | null;
  last_wof_date: string | null;
  next_wof_due_date: string | null;
  rego_expiry_date: string | null;
  notes: string | null;
}

export default async function EditVehiclePage({
  params,
}: {
  params: { id: string };
}) {
  const customer = await getCurrentCustomer();
  if (!customer) return null;

  const supabase = createClient();
  const { data } = await supabase
    .from("customer_vehicles")
    .select(
      "id, year, make, model, rego, vin, colour, purchase_date, last_service_date, last_service_mileage, next_service_due_date, last_wof_date, next_wof_due_date, rego_expiry_date, notes",
    )
    .eq("id", params.id)
    .eq("customer_id", customer.userId)
    .maybeSingle();

  if (!data) notFound();
  const v = data as CustomerVehicle;

  const initial: VehicleFormValues = {
    year: v.year,
    make: v.make,
    model: v.model,
    rego: v.rego ?? "",
    vin: v.vin ?? "",
    colour: v.colour ?? "",
    purchase_date: v.purchase_date ?? "",
    last_service_date: v.last_service_date ?? "",
    last_service_mileage:
      v.last_service_mileage !== null ? String(v.last_service_mileage) : "",
    next_service_due_date: v.next_service_due_date ?? "",
    last_wof_date: v.last_wof_date ?? "",
    next_wof_due_date: v.next_wof_due_date ?? "",
    rego_expiry_date: v.rego_expiry_date ?? "",
    notes: v.notes ?? "",
  };

  return (
    <div className="space-y-6">
      <div>
        <Link
          href={`/account/vehicles/${v.id}`}
          className="text-sm text-silver-dark hover:text-accent"
        >
          ← Back to vehicle
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-navy">
          Edit {v.year} {v.make} {v.model}
        </h1>
      </div>
      <VehicleForm mode="edit" vehicleId={v.id} initial={initial} />
    </div>
  );
}
