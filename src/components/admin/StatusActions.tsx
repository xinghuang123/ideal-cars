"use client";

import { useTransition } from "react";
import type { EnquiryStatus } from "@/types/database";
import { updateEnquiryStatus } from "@/app/admin/actions";

const transitions: Record<EnquiryStatus, EnquiryStatus[]> = {
  new: ["read", "replied", "archived"],
  read: ["replied", "archived"],
  replied: ["archived", "read"],
  archived: ["new"],
};

const labels: Record<EnquiryStatus, string> = {
  new: "Mark unread",
  read: "Mark read",
  replied: "Mark replied",
  archived: "Archive",
};

export default function StatusActions({
  table,
  id,
  status,
}: {
  table:
    | "contact_enquiries"
    | "sell_car_enquiries"
    | "vehicle_enquiries"
    | "finance_applications";
  id: string;
  status: EnquiryStatus;
}) {
  const [pending, startTransition] = useTransition();

  function update(next: EnquiryStatus) {
    startTransition(async () => {
      await updateEnquiryStatus(table, id, next);
    });
  }

  return (
    <div className="flex flex-wrap gap-1">
      {transitions[status].map((next) => (
        <button
          key={next}
          onClick={() => update(next)}
          disabled={pending}
          className="rounded border border-silver bg-white px-2 py-1 text-xs font-medium text-navy hover:bg-gray-50 disabled:opacity-50"
        >
          {labels[next]}
        </button>
      ))}
    </div>
  );
}
