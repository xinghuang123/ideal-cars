import { ConsumerInformationNotice } from "@/types/car";

interface CinCardProps {
  cin?: ConsumerInformationNotice;
}

export default function CinCard({ cin }: CinCardProps) {
  return (
    <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100">
      <div className="flex items-center gap-2 mb-4">
        <CinIcon />
        <h2 className="text-xl font-bold text-navy">
          Consumer Information Notice
        </h2>
      </div>

      {!cin ? (
        <p className="text-sm text-silver-dark italic">
          CIN information is not yet available for this vehicle.
        </p>
      ) : (
        <div className="divide-y divide-gray-100">
          <CinRow label="Security Interest" value={cin.securityInterest} />
          <CinRow label="Registration Plate" value={cin.regoPlate} />
          <CinRow
            label="FM Radio (88–108 MHz)"
            value={cin.hasRadio88to108 ? "Yes" : "No"}
          />
          <CinRow
            label="First Registered in NZ"
            value={cin.nzFirstRegistered}
          />
          <CinRow
            label="Re-registered Vehicle"
            value={cin.isReregistered ? "Yes" : "No"}
            highlight={cin.isReregistered}
          />
          <CinRow
            label="Road User Charges Apply"
            value={cin.rucApplies ? "Yes" : "No"}
          />
          <CinRow
            label="Outstanding RUC"
            value={cin.outstandingRuc ? "Yes" : "No"}
            highlight={cin.outstandingRuc}
          />
          <CinRow
            label="First Registered Overseas"
            value={cin.overseasFirstRegistered}
          />
          <CinRow
            label="Country Last Registered"
            value={cin.countryLastRegistered}
          />
          <CinRow
            label="Imported as Damaged"
            value={cin.importedAsDamaged ? "Yes" : "No"}
            highlight={cin.importedAsDamaged}
          />
        </div>
      )}

      <p className="mt-4 text-xs text-silver-dark">
        Required under the Motor Vehicle Sales Act 2003. If you buy this vehicle,
        the trader must give you a copy of this notice.
      </p>
    </div>
  );
}

function CinRow({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="flex items-center justify-between py-3">
      <span className="text-sm text-silver-dark">{label}</span>
      <span
        className={`text-sm font-medium ${
          highlight ? "text-red-600" : "text-navy"
        }`}
      >
        {value}
      </span>
    </div>
  );
}

function CinIcon() {
  return (
    <svg
      className="h-6 w-6 text-accent"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.5}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
      />
    </svg>
  );
}
