"use client";

import { useState, useTransition } from "react";
import { setVehiclePublished } from "./actions";

export default function PublishToggle({
  vehicleId,
  published,
}: {
  vehicleId: string;
  published: boolean;
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function toggle() {
    setError(null);
    startTransition(async () => {
      const result = await setVehiclePublished(vehicleId, !published);
      if (result.error) setError(result.error);
    });
  }

  return (
    <div className="inline-flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={toggle}
        disabled={pending}
        className={`rounded px-3 py-1 text-xs font-medium disabled:opacity-50 ${
          published
            ? "border border-silver bg-white text-navy hover:bg-gray-50"
            : "bg-accent text-white hover:bg-accent-dark"
        }`}
        title={
          published
            ? "Hide this vehicle from the public site"
            : "Make this vehicle visible on the public site"
        }
      >
        {pending ? "…" : published ? "Unpublish" : "Publish"}
      </button>
      {error && <p className="max-w-[180px] text-right text-[10px] text-red-600">{error}</p>}
    </div>
  );
}
