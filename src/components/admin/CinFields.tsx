"use client";

import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import type { ConsumerInformationNotice } from "@/types/car";
import { DEFAULT_TRADER } from "@/lib/bcg-template";

export function defaultCinFromVehicle(input: {
  price?: number | null;
  mileage?: number | null;
  vin?: string | null;
  wof_expiry?: string | null;
  rego_expiry?: string | null;
  fuel_type?: string | null;
}): ConsumerInformationNotice {
  return {
    trader: { ...DEFAULT_TRADER },
    cashPrice: Number(input.price ?? 0),
    securityInterest: "None",
    engineCapacityCc: 0,
    odometer: Number(input.mileage ?? 0),
    odometerUnit: "km",
    hasRadio88to108: true,
    vin: input.vin ?? "",
    hasWofOrCof: true,
    wofOrCofExpiry: input.wof_expiry ?? "",
    hasVehicleLicence: true,
    vehicleLicenceExpiry: input.rego_expiry ?? "",
    isRegistered: true,
    regoPlate: "",
    nzFirstRegistered: "",
    isReregistered: false,
    operatingFuelType: input.fuel_type ?? "Petrol",
    rucApplies: input.fuel_type === "Diesel",
    outstandingRuc: false,
    overseasFirstRegistered: "",
    countryLastRegistered: "",
    importedAsDamaged: false,
  };
}

export default function CinFields({
  value,
  onChange,
}: {
  value: ConsumerInformationNotice;
  onChange: (next: ConsumerInformationNotice) => void;
}) {
  function set<K extends keyof ConsumerInformationNotice>(
    key: K,
    val: ConsumerInformationNotice[K],
  ) {
    onChange({ ...value, [key]: val });
  }
  function setTrader<K extends keyof ConsumerInformationNotice["trader"]>(
    key: K,
    val: ConsumerInformationNotice["trader"][K],
  ) {
    onChange({ ...value, trader: { ...value.trader, [key]: val } });
  }

  return (
    <div className="space-y-8">
      <fieldset>
        <legend className="mb-3 text-base font-bold text-navy">Trader</legend>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Trader name"
            value={value.trader.name}
            onChange={(e) => setTrader("name", e.target.value)}
          />
          <Input
            label="Address"
            value={value.trader.address}
            onChange={(e) => setTrader("address", e.target.value)}
          />
          <Input
            label="Phone"
            value={value.trader.phone ?? ""}
            onChange={(e) => setTrader("phone", e.target.value)}
          />
          <Input
            label="Contact person"
            value={value.trader.contactPerson ?? ""}
            onChange={(e) => setTrader("contactPerson", e.target.value)}
          />
          <Input
            label="Trader registration #"
            value={value.trader.traderRegistrationNumber}
            onChange={(e) =>
              setTrader("traderRegistrationNumber", e.target.value)
            }
          />
          <BoolField
            label="Registered trader"
            value={value.trader.isRegisteredTrader}
            onChange={(v) => setTrader("isRegisteredTrader", v)}
          />
        </div>
      </fieldset>

      <fieldset>
        <legend className="mb-3 text-base font-bold text-navy">Sale</legend>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Cash price (NZD)"
            type="number"
            min={0}
            step="any"
            value={value.cashPrice}
            onChange={(e) => set("cashPrice", Number(e.target.value))}
          />
          <Input
            label="Security interest"
            value={value.securityInterest}
            onChange={(e) => set("securityInterest", e.target.value)}
          />
        </div>
      </fieldset>

      <fieldset>
        <legend className="mb-3 text-base font-bold text-navy">
          Vehicle identification
        </legend>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="VIN"
            value={value.vin}
            onChange={(e) => set("vin", e.target.value)}
          />
          <Input
            label="Engine capacity (cc)"
            type="number"
            min={0}
            value={value.engineCapacityCc}
            onChange={(e) => set("engineCapacityCc", Number(e.target.value))}
          />
          <Input
            label="Odometer"
            type="number"
            min={0}
            value={value.odometer}
            onChange={(e) => set("odometer", Number(e.target.value))}
          />
          <Select
            label="Odometer unit"
            value={value.odometerUnit}
            onChange={(e) =>
              set("odometerUnit", e.target.value as "km" | "miles")
            }
          >
            <option value="km">km</option>
            <option value="miles">miles</option>
          </Select>
          <BoolField
            label="Radio 88-108 MHz"
            value={value.hasRadio88to108}
            onChange={(v) => set("hasRadio88to108", v)}
          />
        </div>
      </fieldset>

      <fieldset>
        <legend className="mb-3 text-base font-bold text-navy">
          WoF / Licence / Registration
        </legend>
        <div className="grid gap-4 sm:grid-cols-2">
          <BoolField
            label="Has WoF / CoF"
            value={value.hasWofOrCof}
            onChange={(v) => set("hasWofOrCof", v)}
          />
          <Input
            label="WoF / CoF expiry"
            placeholder="dd/mm/yyyy"
            value={value.wofOrCofExpiry}
            onChange={(e) => set("wofOrCofExpiry", e.target.value)}
          />
          <BoolField
            label="Has vehicle licence"
            value={value.hasVehicleLicence}
            onChange={(v) => set("hasVehicleLicence", v)}
          />
          <Input
            label="Vehicle licence expiry"
            placeholder="dd/mm/yyyy"
            value={value.vehicleLicenceExpiry}
            onChange={(e) => set("vehicleLicenceExpiry", e.target.value)}
          />
          <BoolField
            label="Is registered"
            value={value.isRegistered}
            onChange={(v) => set("isRegistered", v)}
          />
          <Input
            label="Rego plate"
            value={value.regoPlate}
            onChange={(e) => set("regoPlate", e.target.value)}
          />
          <Input
            label="NZ first registered"
            placeholder="dd/mm/yyyy"
            value={value.nzFirstRegistered}
            onChange={(e) => set("nzFirstRegistered", e.target.value)}
          />
          <BoolField
            label="Re-registered"
            value={value.isReregistered}
            onChange={(v) => set("isReregistered", v)}
          />
        </div>
      </fieldset>

      <fieldset>
        <legend className="mb-3 text-base font-bold text-navy">
          Fuel & RUC
        </legend>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Operating fuel type"
            value={value.operatingFuelType}
            onChange={(e) => set("operatingFuelType", e.target.value)}
          />
          <BoolField
            label="RUC applies"
            value={value.rucApplies}
            onChange={(v) => set("rucApplies", v)}
          />
          <BoolField
            label="Outstanding RUC"
            value={value.outstandingRuc}
            onChange={(v) => set("outstandingRuc", v)}
          />
        </div>
      </fieldset>

      <fieldset>
        <legend className="mb-3 text-base font-bold text-navy">Import</legend>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Overseas first registered"
            value={value.overseasFirstRegistered}
            onChange={(e) => set("overseasFirstRegistered", e.target.value)}
          />
          <Input
            label="Country last registered"
            value={value.countryLastRegistered}
            onChange={(e) => set("countryLastRegistered", e.target.value)}
          />
          <BoolField
            label="Imported as damaged"
            value={value.importedAsDamaged}
            onChange={(v) => set("importedAsDamaged", v)}
          />
        </div>
      </fieldset>
    </div>
  );
}

function BoolField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <div>
      <span className="mb-1.5 block text-sm font-medium text-navy">
        {label}
      </span>
      <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-silver bg-white px-3 py-2.5">
        <input
          type="checkbox"
          checked={value}
          onChange={(e) => onChange(e.target.checked)}
          className="h-4 w-4 rounded border-silver text-accent focus:ring-accent"
        />
        <span className="text-sm text-navy">{value ? "Yes" : "No"}</span>
      </label>
    </div>
  );
}
