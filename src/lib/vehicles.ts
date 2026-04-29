import { createClient } from "@/lib/supabase/server";
import type { Car } from "@/types/car";
import type { VehicleRow, VehicleImageRow } from "@/types/database";

type RowWithImages = VehicleRow & { vehicle_images: VehicleImageRow[] };

export function dbToCar(row: RowWithImages): Car {
  const images = (row.vehicle_images ?? [])
    .slice()
    .sort((a, b) => {
      if (a.is_primary && !b.is_primary) return -1;
      if (!a.is_primary && b.is_primary) return 1;
      return a.display_order - b.display_order;
    })
    .map((i) => i.image_url);

  return {
    id: row.id,
    make: row.make,
    model: row.model,
    year: row.year,
    price: Number(row.price),
    mileage: row.mileage,
    fuelType: row.fuel_type,
    transmission: row.transmission,
    bodyType: row.body_type,
    engineSize: row.engine_size ?? "",
    colour: row.colour,
    doors: row.doors ?? 0,
    seats: row.seats ?? 0,
    driveType: row.drive_type ?? "",
    images,
    features: row.features ?? [],
    description: row.description ?? "",
    status: row.status,
    wofExpiry: row.wof_expiry ?? "",
    regoExpiry: row.rego_expiry ?? "",
    vin: row.vin ?? undefined,
    stockNumber: row.stock_number,
    cin: row.cin ?? undefined,
    bcg: row.bcg ?? undefined,
  };
}

const SELECT_WITH_IMAGES =
  "*, vehicle_images(id, vehicle_id, image_url, display_order, is_primary, created_at)";

export async function getAllVehicles(): Promise<Car[]> {
  const supabase = createClient();
  const { data } = await supabase
    .from("vehicles")
    .select(SELECT_WITH_IMAGES)
    .order("created_at", { ascending: false });
  return ((data ?? []) as RowWithImages[]).map(dbToCar);
}

export async function getAvailableVehicles(): Promise<Car[]> {
  const supabase = createClient();
  const { data } = await supabase
    .from("vehicles")
    .select(SELECT_WITH_IMAGES)
    .in("status", ["available", "special"])
    .order("created_at", { ascending: false });
  return ((data ?? []) as RowWithImages[]).map(dbToCar);
}

export async function getSpecialVehicles(): Promise<Car[]> {
  const supabase = createClient();
  const { data } = await supabase
    .from("vehicles")
    .select(SELECT_WITH_IMAGES)
    .eq("status", "special")
    .order("created_at", { ascending: false });
  return ((data ?? []) as RowWithImages[]).map(dbToCar);
}

export async function getSoldVehicles(): Promise<Car[]> {
  const supabase = createClient();
  const { data } = await supabase
    .from("vehicles")
    .select(SELECT_WITH_IMAGES)
    .eq("status", "sold")
    .order("created_at", { ascending: false });
  return ((data ?? []) as RowWithImages[]).map(dbToCar);
}

export async function getVehicleById(id: string): Promise<Car | null> {
  const supabase = createClient();
  const { data } = await supabase
    .from("vehicles")
    .select(SELECT_WITH_IMAGES)
    .eq("id", id)
    .maybeSingle();
  if (!data) return null;
  return dbToCar(data as RowWithImages);
}

export async function getAllVehicleIds(): Promise<string[]> {
  const supabase = createClient();
  const { data } = await supabase.from("vehicles").select("id");
  return (data ?? []).map((r) => (r as { id: string }).id);
}
