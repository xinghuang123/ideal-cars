import Link from "next/link";
import VehicleForm from "../VehicleForm";

export default function NewVehiclePage() {
  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/admin/vehicles"
          className="text-sm text-silver-dark hover:text-accent"
        >
          ← Back to Vehicles
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-navy">Add Vehicle</h1>
      </div>
      <div className="rounded-xl border border-silver bg-white p-6 shadow-sm">
        <VehicleForm />
      </div>
    </div>
  );
}
