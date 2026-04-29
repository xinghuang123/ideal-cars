import type { EnquiryStatus } from "@/types/database";

const styles: Record<EnquiryStatus, string> = {
  new: "bg-blue-100 text-blue-800",
  read: "bg-gray-100 text-gray-800",
  replied: "bg-green-100 text-green-800",
  archived: "bg-yellow-100 text-yellow-800",
};

export default function StatusBadge({ status }: { status: EnquiryStatus }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium uppercase tracking-wide ${styles[status]}`}
    >
      {status}
    </span>
  );
}
