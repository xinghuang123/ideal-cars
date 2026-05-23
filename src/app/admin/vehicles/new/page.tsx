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
      <div className="rounded-lg border border-accent/30 bg-accent/5 p-4 text-sm text-navy">
        <p className="font-semibold">Tip</p>
        <p className="mt-1 text-silver-dark">
          You can fill in the <strong>Consumer Information Notice</strong> and{" "}
          <strong>Basic Condition Guide</strong> right in this form (expand the
          collapsed sections below), or save the vehicle first and add them on
          the edit page later. Once saved, both become download buttons on the
          public listing.
        </p>
      </div>
      <div className="rounded-xl border border-silver bg-white p-6 shadow-sm">
        <VehicleForm />
      </div>
    </div>
  );
}
