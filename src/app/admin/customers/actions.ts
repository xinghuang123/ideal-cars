"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

interface AssignVehicleInput {
  customerId: string;
  purchasedVehicleId: string;
  purchaseDate: string | null;
}

export async function assignDealerVehicleToCustomer(
  input: AssignVehicleInput,
): Promise<{ ok?: true; error?: string }> {
  const supabase = createClient();

  const { data: vehicle, error: vErr } = await supabase
    .from("vehicles")
    .select("id, year, make, model, colour")
    .eq("id", input.purchasedVehicleId)
    .maybeSingle();

  if (vErr || !vehicle) {
    return { error: vErr?.message ?? "Vehicle not found" };
  }

  // Insert customer_vehicles record.
  const { error: insertErr } = await supabase.from("customer_vehicles").insert({
    customer_id: input.customerId,
    purchased_vehicle_id: vehicle.id,
    purchased_from_dealer: true,
    year: vehicle.year,
    make: vehicle.make,
    model: vehicle.model,
    colour: vehicle.colour,
    purchase_date: input.purchaseDate,
  });
  if (insertErr) return { error: insertErr.message };

  // Mark dealer's vehicle as sold.
  await supabase
    .from("vehicles")
    .update({ status: "sold" })
    .eq("id", vehicle.id);

  revalidatePath(`/admin/customers/${input.customerId}`);
  revalidatePath("/admin/customers");
  revalidatePath("/admin/vehicles");
  return { ok: true };
}

interface ExternalVehicleInput {
  customerId: string;
  year: number;
  make: string;
  model: string;
  rego: string | null;
  vin: string | null;
  colour: string | null;
  purchase_date: string | null;
  notes: string | null;
}

export async function addExternalVehicleToCustomer(
  input: ExternalVehicleInput,
): Promise<{ ok?: true; error?: string }> {
  if (!input.make || !input.model) {
    return { error: "Make and model are required." };
  }

  const supabase = createClient();
  const { error } = await supabase.from("customer_vehicles").insert({
    customer_id: input.customerId,
    purchased_from_dealer: false,
    year: input.year,
    make: input.make,
    model: input.model,
    rego: input.rego,
    vin: input.vin,
    colour: input.colour,
    purchase_date: input.purchase_date,
    notes: input.notes,
  });
  if (error) return { error: error.message };

  revalidatePath(`/admin/customers/${input.customerId}`);
  revalidatePath(`/admin/customers`);
  return { ok: true };
}

interface ServiceRecordInput {
  customerVehicleId: string;
  service_date: string;
  service_type: string;
  mileage: number | null;
  description: string | null;
  cost: number | null;
  next_service_due_date: string | null;
  performed_by: string | null;
}

export async function addServiceRecord(input: ServiceRecordInput) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { error } = await supabase.from("service_records").insert({
    customer_vehicle_id: input.customerVehicleId,
    record_type: "service",
    service_date: input.service_date,
    service_type: input.service_type,
    mileage: input.mileage,
    description: input.description,
    cost: input.cost,
    next_service_due_date: input.next_service_due_date,
    performed_by: input.performed_by,
    created_by: user?.id ?? null,
  });
  if (error) return { error: error.message };

  // Bump vehicle's last/next service info to match.
  await supabase
    .from("customer_vehicles")
    .update({
      last_service_date: input.service_date,
      last_service_mileage: input.mileage,
      next_service_due_date: input.next_service_due_date,
    })
    .eq("id", input.customerVehicleId);

  revalidatePath(`/admin/customers`);
  return { ok: true };
}

interface RepairRecordInput {
  customerVehicleId: string;
  service_date: string;
  service_type: string;
  mileage: number | null;
  diagnosis: string | null;
  work_done: string | null;
  parts_cost: number | null;
  labour_cost: number | null;
  cost: number | null;
  warranty_until: string | null;
  performed_by: string | null;
}

export async function addRepairRecord(input: RepairRecordInput) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { error } = await supabase.from("service_records").insert({
    customer_vehicle_id: input.customerVehicleId,
    record_type: "repair",
    service_date: input.service_date,
    service_type: input.service_type,
    mileage: input.mileage,
    diagnosis: input.diagnosis,
    work_done: input.work_done,
    parts_cost: input.parts_cost,
    labour_cost: input.labour_cost,
    cost: input.cost,
    warranty_until: input.warranty_until,
    performed_by: input.performed_by,
    created_by: user?.id ?? null,
  });
  if (error) return { error: error.message };

  revalidatePath(`/admin/customers`);
  return { ok: true };
}

export async function removeCustomerVehicle(
  vehicleId: string,
  customerId: string,
) {
  const supabase = createClient();
  const { error } = await supabase
    .from("customer_vehicles")
    .delete()
    .eq("id", vehicleId);
  if (error) throw new Error(error.message);

  revalidatePath(`/admin/customers/${customerId}`);
  redirect(`/admin/customers/${customerId}`);
}
