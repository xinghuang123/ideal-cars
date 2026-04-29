import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import { formatPrice, formatMileage } from "@/lib/utils";
import DeleteVehicleButton from "./DeleteVehicleButton";
import type { VehicleImageRow, VehicleRow } from "@/types/database";

const statusStyles = {
  available: "bg-green-100 text-green-800",
  special: "bg-blue-100 text-blue-800",
  sold: "bg-gray-100 text-gray-600",
};

type VehicleWithThumb = VehicleRow & { thumbUrl: string | null };

export default async function VehiclesAdminPage() {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("vehicles")
    .select("*, vehicle_images(image_url, is_primary)")
    .order("created_at", { ascending: false });

  type Joined = VehicleRow & {
    vehicle_images: Pick<VehicleImageRow, "image_url" | "is_primary">[];
  };
  const vehicles: VehicleWithThumb[] = (data ?? []).map((row) => {
    const r = row as Joined;
    const primary =
      r.vehicle_images?.find((i) => i.is_primary)?.image_url ??
      r.vehicle_images?.[0]?.image_url ??
      null;
    return { ...r, thumbUrl: primary };
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-navy">Vehicles</h1>
          <p className="mt-1 text-sm text-silver-dark">
            {vehicles.length} total
          </p>
        </div>
        <Link
          href="/admin/vehicles/new"
          className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white hover:bg-accent-dark"
        >
          + Add Vehicle
        </Link>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          Failed to load: {error.message}
        </div>
      )}

      {vehicles.length === 0 ? (
        <div className="rounded-xl border border-silver bg-white p-12 text-center text-silver-dark">
          No vehicles yet. Add your first one.
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-silver bg-white shadow-sm">
          <table className="w-full divide-y divide-silver">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-silver-dark">
                  Stock #
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-silver-dark">
                  Vehicle
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-silver-dark">
                  Price
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-silver-dark">
                  Mileage
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-silver-dark">
                  Status
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-silver-dark">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-silver">
              {vehicles.map((v) => (
                <tr key={v.id}>
                  <td className="px-4 py-3 text-sm font-mono text-silver-dark">
                    {v.stock_number}
                  </td>
                  <td className="px-4 py-3 text-sm text-navy">
                    <div className="flex items-center gap-3">
                      <div className="relative h-12 w-16 shrink-0 overflow-hidden rounded bg-gray-100">
                        {v.thumbUrl ? (
                          <Image
                            src={v.thumbUrl}
                            alt=""
                            fill
                            className="object-cover"
                            sizes="64px"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center text-[10px] text-silver-dark">
                            No image
                          </div>
                        )}
                      </div>
                      <div>
                        <span className="font-medium">
                          {v.year} {v.make} {v.model}
                        </span>
                        <p className="text-xs text-silver-dark">
                          {v.body_type} · {v.fuel_type} · {v.colour}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-navy">
                    {formatPrice(v.price)}
                  </td>
                  <td className="px-4 py-3 text-sm text-silver-dark">
                    {formatMileage(v.mileage)}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium uppercase ${statusStyles[v.status]}`}
                    >
                      {v.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right text-sm">
                    <div className="flex items-center justify-end gap-3">
                      <Link
                        href={`/admin/vehicles/${v.id}/edit`}
                        className="text-xs font-medium text-accent hover:text-accent-dark"
                      >
                        Edit
                      </Link>
                      <DeleteVehicleButton
                        id={v.id}
                        label={`${v.year} ${v.make} ${v.model}`}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
