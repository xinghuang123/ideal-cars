"use client";

import { useTransition } from "react";
import { deleteVehicle } from "./actions";

export default function DeleteVehicleButton({
  id,
  label,
}: {
  id: string;
  label: string;
}) {
  const [pending, startTransition] = useTransition();

  function handleClick() {
    if (!confirm(`Delete ${label}? This cannot be undone.`)) return;
    startTransition(async () => {
      await deleteVehicle(id);
    });
  }

  return (
    <button
      onClick={handleClick}
      disabled={pending}
      className="text-xs font-medium text-red-600 hover:text-red-800 disabled:opacity-50"
    >
      {pending ? "Deleting..." : "Delete"}
    </button>
  );
}
