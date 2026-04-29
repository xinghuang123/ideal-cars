"use client";

import { useTransition } from "react";
import { setSubscriberActive } from "@/app/admin/actions";

export default function SubscriberToggle({
  id,
  isActive,
}: {
  id: string;
  isActive: boolean;
}) {
  const [pending, startTransition] = useTransition();

  function toggle() {
    startTransition(async () => {
      await setSubscriberActive(id, !isActive);
    });
  }

  return (
    <button
      onClick={toggle}
      disabled={pending}
      className="rounded border border-silver bg-white px-3 py-1 text-xs font-medium text-navy hover:bg-gray-50 disabled:opacity-50"
    >
      {pending
        ? "..."
        : isActive
          ? "Unsubscribe"
          : "Resubscribe"}
    </button>
  );
}
