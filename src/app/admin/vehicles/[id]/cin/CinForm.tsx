"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import CinFields, { defaultCinFromVehicle } from "@/components/admin/CinFields";
import type { ConsumerInformationNotice } from "@/types/car";
import type { VehicleRow } from "@/types/database";
import { updateVehicleCin } from "./actions";

export default function CinForm({
  vehicle,
  initial,
}: {
  vehicle: VehicleRow;
  initial: ConsumerInformationNotice | null;
}) {
  const router = useRouter();
  const seed = initial ?? defaultCinFromVehicle(vehicle);
  const [cin, setCin] = useState<ConsumerInformationNotice>(seed);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const res = await updateVehicleCin(vehicle.id, cin);
      if ("error" in res && res.error) {
        setError(res.error);
        return;
      }
      router.push(`/admin/vehicles/${vehicle.id}/edit`);
      router.refresh();
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <CinFields value={cin} onChange={setCin} />

      <Button type="submit" size="lg" disabled={pending}>
        {pending ? "Saving..." : "Save CIN"}
      </Button>
    </form>
  );
}
