"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import BcgFields, {
  defaultBcg,
  mergeBcgWithStandard,
} from "@/components/admin/BcgFields";
import type { BasicConditionGuide } from "@/types/car";
import type { VehicleRow } from "@/types/database";
import { updateVehicleBcg } from "./actions";

export default function BcgForm({
  vehicle,
  initial,
}: {
  vehicle: VehicleRow;
  initial: BasicConditionGuide | null;
}) {
  const router = useRouter();
  const [bcg, setBcg] = useState<BasicConditionGuide>(
    initial ? mergeBcgWithStandard(initial) : defaultBcg(),
  );
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const res = await updateVehicleBcg(vehicle.id, bcg);
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

      <BcgFields value={bcg} onChange={setBcg} />

      <Button type="submit" size="lg" disabled={pending}>
        {pending ? "Saving..." : "Save BCG"}
      </Button>
    </form>
  );
}
