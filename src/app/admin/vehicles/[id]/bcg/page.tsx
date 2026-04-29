import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import BcgForm from "./BcgForm";
import type { VehicleRow } from "@/types/database";

export default async function BcgEditPage({
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
          Basic Condition Guide
        </h1>
        <p className="text-sm text-silver-dark">
          Inspection results across the standard NZ BCG checklist.
        </p>
      </div>

      <div className="rounded-xl border border-silver bg-white p-6 shadow-sm">
        <BcgForm vehicle={vehicle} initial={vehicle.bcg} />
      </div>
    </div>
  );
}
