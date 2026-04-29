import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import CinForm from "./CinForm";
import type { VehicleRow } from "@/types/database";

export default async function CinEditPage({
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

  return (
    <div className="space-y-6">
      <div>
        <Link
          href={`/admin/vehicles/${vehicle.id}/edit`}
          className="text-sm text-silver-dark hover:text-accent"
        >
          ← Back to {vehicle.year} {vehicle.make} {vehicle.model}
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-navy">
          Consumer Information Notice
        </h1>
        <p className="text-sm text-silver-dark">
          Required for all used vehicles offered for sale by traders (Fair Trading Act).
        </p>
      </div>

      <div className="rounded-xl border border-silver bg-white p-6 shadow-sm">
        <CinForm vehicle={vehicle} initial={vehicle.cin} />
      </div>
    </div>
  );
}
