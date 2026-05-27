import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import VehicleForm from "../../VehicleForm";
import VehicleImageManager from "./VehicleImageManager";
import type { VehicleImageRow, VehicleRow } from "@/types/database";

export default async function EditVehiclePage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createClient();
  const { data } = await supabase
    .from("vehicles")
    .select("*")
    .eq("id", params.id)
    .single();

  if (!data) notFound();
  const vehicle = data as VehicleRow;

  const { data: imagesData } = await supabase
    .from("vehicle_images")
    .select("*")
    .eq("vehicle_id", vehicle.id)
    .order("display_order");
  const images = (imagesData ?? []) as VehicleImageRow[];

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/admin/vehicles"
          className="text-sm text-silver-dark hover:text-accent"
        >
          ← Back to Vehicles
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-navy">
          Edit {vehicle.year} {vehicle.make} {vehicle.model}
        </h1>
        <p className="text-sm text-silver-dark">Stock #{vehicle.stock_number}</p>
      </div>

      <div className="rounded-xl border border-silver bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-bold text-navy">Images</h2>
        <VehicleImageManager vehicleId={vehicle.id} initialImages={images} />
      </div>

      <div className="rounded-xl border border-silver bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-bold text-navy">Details</h2>
        <VehicleForm initial={vehicle} />
      </div>
    </div>
  );
}
