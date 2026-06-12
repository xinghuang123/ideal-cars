"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { embed, vehicleEmbeddingText } from "@/lib/embeddings";
import type {
  BodyType,
  FuelType,
  TransmissionType,
  VehicleStatus,
} from "@/types/database";

function parseVehicleForm(formData: FormData) {
  const featuresRaw = String(formData.get("features") ?? "");
  const features = featuresRaw
    .split(",")
    .map((f) => f.trim())
    .filter(Boolean);

  const num = (key: string) => {
    const v = formData.get(key);
    if (v === null || v === "") return null;
    return Number(v);
  };
  const str = (key: string) => {
    const v = formData.get(key);
    return v ? String(v).trim() : "";
  };
  const optStr = (key: string) => {
    const v = formData.get(key);
    return v && String(v).trim() ? String(v).trim() : null;
  };

  return {
    stock_number: str("stock_number"),
    make: str("make"),
    model: str("model"),
    year: num("year"),
    price: num("price"),
    mileage: num("mileage"),
    fuel_type: str("fuel_type") as FuelType,
    transmission: str("transmission") as TransmissionType,
    body_type: str("body_type") as BodyType,
    engine_size: optStr("engine_size"),
    colour: str("colour"),
    doors: num("doors"),
    seats: num("seats"),
    drive_type: optStr("drive_type"),
    features,
    description: optStr("description"),
    status: (str("status") || "available") as VehicleStatus,
    wof_expiry: optStr("wof_expiry"),
    rego_expiry: optStr("rego_expiry"),
    vin: optStr("vin"),
  };
}

async function regenerateEmbedding(vehicleId: string, data: ReturnType<typeof parseVehicleForm>) {
  if (data.year === null || !data.make || !data.model) return;
  try {
    const text = vehicleEmbeddingText({
      year: data.year,
      make: data.make,
      model: data.model,
      body_type: data.body_type,
      fuel_type: data.fuel_type,
      transmission: data.transmission,
      drive_type: data.drive_type,
      colour: data.colour,
      engine_size: data.engine_size,
      mileage: data.mileage,
      price: data.price,
      description: data.description,
      features: data.features,
    });
    const vec = await embed(text);
    const supabase = createClient();
    await supabase
      .from("vehicles")
      .update({
        embedding: vec as unknown as string,
        embedding_text: text,
        embedding_updated_at: new Date().toISOString(),
      })
      .eq("id", vehicleId);
  } catch (err) {
    console.error("Failed to regenerate embedding for vehicle", vehicleId, err);
  }
}

export async function createVehicle(formData: FormData) {
  const supabase = createClient();
  const data = parseVehicleForm(formData);

  const { data: created, error } = await supabase
    .from("vehicles")
    .insert(data)
    .select("id")
    .single();
  if (error) {
    return { error: error.message };
  }

  await regenerateEmbedding(created.id, data);

  revalidatePath("/admin/vehicles");
  revalidatePath("/admin");
  return { vehicleId: created.id as string };
}

export async function updateVehicle(id: string, formData: FormData) {
  const supabase = createClient();
  const data = parseVehicleForm(formData);

  const { error } = await supabase.from("vehicles").update(data).eq("id", id);
  if (error) {
    return { error: error.message };
  }

  await regenerateEmbedding(id, data);

  revalidatePath("/admin/vehicles");
  revalidatePath("/admin");
  redirect("/admin/vehicles");
}

export async function setVehiclePublished(
  id: string,
  published: boolean,
): Promise<{ ok?: true; error?: string }> {
  const supabase = createClient();

  // Read back the updated row so a stale session (RLS matching 0 rows
  // without an error) fails loudly instead of reporting fake success.
  const { data, error } = await supabase
    .from("vehicles")
    .update({ published })
    .eq("id", id)
    .select("id");
  if (error) return { error: error.message };
  if (!data || data.length === 0) {
    return { error: "Nothing updated — your session may have expired. Please sign in again." };
  }

  revalidatePath("/admin/vehicles");
  revalidatePath("/admin");
  revalidatePath("/buy");
  revalidatePath(`/buy/${id}`);
  revalidatePath("/");
  return { ok: true };
}

export async function deleteVehicle(id: string) {
  const supabase = createClient();
  const { error } = await supabase.from("vehicles").delete().eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/admin/vehicles");
  revalidatePath("/admin");
}
