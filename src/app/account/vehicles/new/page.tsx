import Link from "next/link";
import VehicleForm, { emptyVehicle } from "../VehicleForm";

export const dynamic = "force-dynamic";

export default function NewVehiclePage() {
  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/account/vehicles"
          className="text-sm text-silver-dark hover:text-accent"
        >
          ← Back to my vehicles
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-navy">Add a vehicle</h1>
        <p className="mt-1 text-sm text-silver-dark">
          You can also add cars you bought elsewhere — we&apos;ll happily service
          them.
        </p>
      </div>
      <VehicleForm mode="new" initial={emptyVehicle} />
    </div>
  );
}
