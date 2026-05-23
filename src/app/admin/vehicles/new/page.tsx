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
        <p className="font-semibold">After you save this vehicle, you can:</p>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-silver-dark">
          <li>Add or reorder more photos</li>
          <li>
            Fill in the <strong>Consumer Information Notice (CIN)</strong> —
            required for used vehicles under the NZ Fair Trading Act
          </li>
          <li>
            Fill in the <strong>Basic Condition Guide (BCG)</strong> — grades
            the vehicle&apos;s overall condition for buyers
          </li>
        </ul>
        <p className="mt-2 text-xs text-silver-dark">
          Both PDFs will appear as download buttons on the public vehicle page
          once filled in.
        </p>
      </div>
      <div className="rounded-xl border border-silver bg-white p-6 shadow-sm">
        <VehicleForm />
      </div>
    </div>
  );
}
