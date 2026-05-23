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
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-navy">
              Compliance Documents
            </h2>
            <p className="text-sm text-silver-dark">
              Required for used vehicle sale (NZ Fair Trading Act).
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              href={`/admin/vehicles/${vehicle.id}/cin`}
              className="rounded-lg border border-accent px-4 py-2 text-sm font-semibold text-accent hover:bg-accent hover:text-white"
            >
              Edit CIN {vehicle.cin ? "✓" : ""}
            </Link>
            {vehicle.cin && (
              <a
                href={`/api/vehicles/${vehicle.id}/cin.pdf`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-lg border border-silver bg-white px-4 py-2 text-sm font-semibold text-navy hover:border-accent hover:text-accent"
              >
                <svg
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5m0 0l5-5m-5 5V4"
                  />
                </svg>
                Preview CIN PDF
              </a>
            )}
            <Link
              href={`/admin/vehicles/${vehicle.id}/bcg`}
              className="rounded-lg border border-accent px-4 py-2 text-sm font-semibold text-accent hover:bg-accent hover:text-white"
            >
              Edit BCG {vehicle.bcg ? "✓" : ""}
            </Link>
            {vehicle.bcg && (
              <a
                href={`/api/vehicles/${vehicle.id}/bcg.pdf`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-lg border border-silver bg-white px-4 py-2 text-sm font-semibold text-navy hover:border-accent hover:text-accent"
              >
                <svg
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5m0 0l5-5m-5 5V4"
                  />
                </svg>
                Preview BCG PDF
              </a>
            )}
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-silver bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-bold text-navy">Details</h2>
        <VehicleForm initial={vehicle} />
      </div>
    </div>
  );
}
