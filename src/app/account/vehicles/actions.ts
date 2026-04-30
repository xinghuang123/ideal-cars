"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

interface VehicleInput {
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

function parseForm(formData: FormData): VehicleInput {
  const num = (k: string): number | null => {
    const v = formData.get(k);
    if (v === null || v === "") return null;
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  };
  const str = (k: string): string => {
    const v = formData.get(k);
    return v ? String(v).trim() : "";
  };
  const optStr = (k: string): string | null => {
    const v = str(k);
    return v || null;
  };

  return {
    year: num("year") ?? new Date().getFullYear(),
    make: str("make"),
    model: str("model"),
    rego: optStr("rego"),
    vin: optStr("vin"),
    colour: optStr("colour"),
    purchase_date: optStr("purchase_date"),
    last_service_date: optStr("last_service_date"),
    last_service_mileage: num("last_service_mileage"),
    next_service_due_date: optStr("next_service_due_date"),
    last_wof_date: optStr("last_wof_date"),
    next_wof_due_date: optStr("next_wof_due_date"),
    rego_expiry_date: optStr("rego_expiry_date"),
    notes: optStr("notes"),
  };
}

export async function createCustomerVehicle(formData: FormData) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not signed in." };

  const data = parseForm(formData);
  if (!data.make || !data.model) {
    return { error: "Make and model are required." };
  }

  const { error } = await supabase.from("customer_vehicles").insert({
    customer_id: user.id,
    purchased_from_dealer: false,
    ...data,
  });

  if (error) return { error: error.message };

  revalidatePath("/account/vehicles");
  revalidatePath("/account");
  redirect("/account/vehicles");
}

export async function updateCustomerVehicle(id: string, formData: FormData) {
  const supabase = createClient();
  const data = parseForm(formData);

  const { error } = await supabase
    .from("customer_vehicles")
    .update(data)
    .eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/account/vehicles");
  revalidatePath(`/account/vehicles/${id}`);
  redirect(`/account/vehicles/${id}`);
}

export async function deleteCustomerVehicle(id: string) {
  const supabase = createClient();
  const { error } = await supabase
    .from("customer_vehicles")
    .delete()
    .eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/account/vehicles");
  revalidatePath("/account");
  redirect("/account/vehicles");
}
