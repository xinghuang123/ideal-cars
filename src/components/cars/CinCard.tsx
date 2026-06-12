"use client";

import { useState } from "react";
import { ConsumerInformationNotice } from "@/types/car";
import { formatNzDate } from "@/lib/utils";

interface CinCardProps {
  cin?: ConsumerInformationNotice;
  make?: string;
  model?: string;
  year?: number;
}

export default function CinCard({ cin, make, model, year }: CinCardProps) {
  const [showBack, setShowBack] = useState(false);

  return (
    <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <CinIcon />
          <h2 className="text-xl font-bold text-navy">
            Consumer Information Notice
          </h2>
        </div>
        {cin && (
          <button
            onClick={() => setShowBack(!showBack)}
            className="text-sm font-medium text-accent hover:text-accent-dark transition-colors"
          >
            {showBack ? "Show Front" : "Important Information"}
          </button>
        )}
      </div>

      {!cin ? (
        <p className="text-sm text-silver-dark italic">
          CIN information is not yet available for this vehicle.
        </p>
      ) : showBack ? (
        <CinBackPage />
      ) : (
        <CinFrontPage cin={cin} make={make} model={model} year={year} />
      )}
    </div>
  );
}

function CinFrontPage({
  cin,
  make,
  model,
  year,
}: {
  cin: ConsumerInformationNotice;
  make?: string;
  model?: string;
  year?: number;
}) {
  return (
    <div className="space-y-6">
      {/* Trader information */}
      <div className="rounded-lg bg-gray-50 p-4">
        <p className="text-sm font-semibold text-navy">{cin.trader.name}</p>
        <p className="text-xs text-silver-dark">{cin.trader.address}</p>
        {cin.trader.phone && (
          <p className="text-xs text-silver-dark mt-1">
            Phone: {cin.trader.phone}
          </p>
        )}
        {cin.trader.contactPerson && (
          <p className="text-xs text-silver-dark">
            Contact: {cin.trader.contactPerson}
          </p>
        )}
        <div className="mt-2 flex gap-4 text-xs text-silver-dark">
          <span>
            Registered trader:{" "}
            <strong className="text-navy">
              {cin.trader.isRegisteredTrader ? "Yes" : "No"}
            </strong>
          </span>
          <span>
            Registration #:{" "}
            <strong className="text-navy">
              {cin.trader.traderRegistrationNumber}
            </strong>
          </span>
        </div>
      </div>

      {/* Sale information */}
      <div>
        <SectionLabel>Sale Information</SectionLabel>
        <div className="divide-y divide-gray-100">
          <CinRow
            label="Cash price (incl. GST, registration & licensing)"
            value={`$${cin.cashPrice.toLocaleString()}`}
          />
          <CinRow label="Security interest" value={cin.securityInterest} />
          {cin.securityInterest !== "None" && (
            <p className="py-2 text-xs text-amber-700 bg-amber-50 px-3 rounded">
              WARNING: A security interest means this vehicle could be security
              for a loan and could be repossessed.
            </p>
          )}
        </div>
      </div>

      {/* Vehicle details */}
      <div>
        <SectionLabel>Vehicle Details</SectionLabel>
        <div className="divide-y divide-gray-100">
          <CinRow
            label="Make and model"
            value={`${make} ${model}`}
          />
          <CinRow label="Vehicle year" value={String(year)} />
          <CinRow
            label="Engine capacity"
            value={`${cin.engineCapacityCc.toLocaleString()} cc`}
          />
          <CinRow
            label="Actual distance travelled"
            value={`${cin.odometer.toLocaleString()} ${cin.odometerUnit}`}
          />
          <CinRow
            label="Radio receiver (88–108 MHz)"
            value={cin.hasRadio88to108 ? "Yes" : "No"}
          />
          <CinRow label="VIN / Chassis number" value={cin.vin} />
        </div>
      </div>

      {/* WoF & Licence */}
      <div>
        <SectionLabel>Warrant of Fitness & Licence</SectionLabel>
        <div className="divide-y divide-gray-100">
          <CinRow
            label="Warrant or Certificate of Fitness"
            value={cin.hasWofOrCof ? "Yes" : "No"}
            highlight={!cin.hasWofOrCof}
          />
          <CinRow label="WoF / CoF expiry date" value={formatNzDate(cin.wofOrCofExpiry)} />
          <CinRow
            label="Vehicle licence"
            value={cin.hasVehicleLicence ? "Yes" : "No"}
            highlight={!cin.hasVehicleLicence}
          />
          <CinRow
            label="Vehicle licence expiry date"
            value={formatNzDate(cin.vehicleLicenceExpiry)}
          />
        </div>
      </div>

      {/* Registration */}
      <div>
        <SectionLabel>Registration</SectionLabel>
        <div className="divide-y divide-gray-100">
          <CinRow
            label="Registered vehicle"
            value={cin.isRegistered ? "Yes" : "No"}
          />
          <CinRow label="Registration plate" value={cin.regoPlate} />
          <CinRow
            label="Year first registered in NZ"
            value={formatNzDate(cin.nzFirstRegistered)}
          />
          <CinRow
            label="Re-registered vehicle"
            value={cin.isReregistered ? "Yes" : "No"}
            highlight={cin.isReregistered}
          />
        </div>
      </div>

      {/* Fuel & RUC */}
      <div>
        <SectionLabel>Fuel & Road User Charges</SectionLabel>
        <div className="divide-y divide-gray-100">
          <CinRow label="Operating fuel type" value={cin.operatingFuelType} />
          <CinRow
            label="Road user charges apply"
            value={cin.rucApplies ? "Yes" : "No"}
          />
          <CinRow
            label="Outstanding road user charges"
            value={cin.outstandingRuc ? "Yes" : "No"}
            highlight={cin.outstandingRuc}
          />
        </div>
      </div>

      {/* Import information */}
      <div>
        <SectionLabel>Information About Used Imported Vehicles</SectionLabel>
        <div className="divide-y divide-gray-100">
          <CinRow
            label="Year first registered overseas"
            value={formatNzDate(cin.overseasFirstRegistered)}
          />
          <CinRow
            label="Country where last registered"
            value={cin.countryLastRegistered}
          />
          <CinRow
            label="Imported as damaged vehicle"
            value={cin.importedAsDamaged ? "Yes" : "No"}
            highlight={cin.importedAsDamaged}
          />
        </div>
      </div>

      <p className="text-xs text-silver-dark border-t border-gray-100 pt-4">
        If you buy this motor vehicle, the trader MUST give you a copy of this
        notice to keep. Required under the Motor Vehicle Sales Act 2003.
      </p>
    </div>
  );
}

function CinBackPage() {
  return (
    <div className="space-y-5 text-sm text-silver-dark leading-relaxed">
      <h3 className="font-bold text-navy text-base">
        Important Information
      </h3>

      <p>
        There are protections under the Motor Vehicle Sales Act 2003 when you
        buy a motor vehicle from a motor vehicle trader. Motor vehicle traders
        include car dealers, car auctioneers, car importers, and car
        wholesalers.
      </p>

      <div>
        <h4 className="font-semibold text-navy mb-1">
          Motor Vehicle Trader Registration
        </h4>
        <p>
          Under the Motor Vehicle Sales Act 2003, a motor vehicle trader must be
          registered, attach this notice to a used motor vehicle displayed for
          sale, and provide you with a signed copy or electronic version of this
          notice when you buy a used motor vehicle.
        </p>
      </div>

      <div>
        <h4 className="font-semibold text-navy mb-1">Security Interest</h4>
        <p>
          If a finance company or a person lends money to someone to buy a motor
          vehicle, the lender can register a security interest over the vehicle
          on the Personal Property Securities Register (PPSR). You should check
          the PPSR to ensure that the motor vehicle you intend to buy is free of
          a registered security interest. Visit{" "}
          <span className="text-accent">www.ppsr.govt.nz</span>.
        </p>
        <p className="mt-2 text-amber-700 font-medium">
          WARNING: If you buy a used motor vehicle that has a security interest
          registered on the PPSR and the motor vehicle trader discloses the
          security interest, the vehicle could be repossessed.
        </p>
      </div>

      <div>
        <h4 className="font-semibold text-navy mb-1">
          Actual Distance Vehicle Has Travelled
        </h4>
        <p>
          You should not place too much importance on the odometer reading when
          buying a used motor vehicle. There is a risk with any used motor
          vehicle that the odometer has been wound back. A vehicle&apos;s mechanical
          condition is a better indicator of its quality.
        </p>
      </div>

      <div>
        <h4 className="font-semibold text-navy mb-1">
          Re-registered Vehicle
        </h4>
        <p>
          Re-registration is necessary if a motor vehicle&apos;s registration has
          been cancelled. Common reasons include a vehicle being &ldquo;written
          off&rdquo; by an insurance company, being destroyed or rendered
          useless, or being unlicensed for more than 1 year.
        </p>
      </div>

      <div>
        <h4 className="font-semibold text-navy mb-1">Road User Charges</h4>
        <p>
          All diesel-powered motor vehicles, and vehicles over 3,500 kg, are
          subject to road user charges. Contact the helpdesk on free phone{" "}
          <span className="font-medium text-navy">0800 655 644</span>.
        </p>
      </div>

      <div>
        <h4 className="font-semibold text-navy mb-1">
          Imported as Damaged Vehicle
        </h4>
        <p>
          Land Transport NZ records whether imported used vehicles had obvious
          structural damage or deterioration at the time of importation. However,
          the extent of damage is not recorded, nor is any damage that may have
          occurred in New Zealand.
        </p>
      </div>

      <div>
        <h4 className="font-semibold text-navy mb-1">Your Consumer Rights</h4>
        <p>
          Under the <strong>Consumer Guarantees Act 1993</strong>, a vehicle
          must be of acceptable quality, fit for purpose, match its description,
          and be free of undisclosed security interests.
        </p>
        <p className="mt-2">
          Under the <strong>Fair Trading Act 1986</strong>, information given to
          you by a motor vehicle trader must be true and the information on this
          notice must be correct.
        </p>
      </div>

      <div>
        <h4 className="font-semibold text-navy mb-1">
          Motor Vehicle Disputes Tribunal
        </h4>
        <p>
          The Tribunal can hear claims against a motor vehicle trader under the
          Fair Trading Act 1986, the Consumer Guarantees Act 1993, or the Sale
          of Goods Act 1908. Free phone{" "}
          <span className="font-medium text-navy">
            0800 FOR MVDT (0800 367 6838)
          </span>
          .
        </p>
      </div>

      <div>
        <h4 className="font-semibold text-navy mb-1">
          Change of Ownership
        </h4>
        <p>
          Within 7 days after taking ownership you must complete a Notice of
          Change of Ownership. Free phone{" "}
          <span className="font-medium text-navy">0800 108 809</span> for more
          information.
        </p>
      </div>
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="mb-2 text-sm font-semibold text-navy uppercase tracking-wide">
      {children}
    </h3>
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
