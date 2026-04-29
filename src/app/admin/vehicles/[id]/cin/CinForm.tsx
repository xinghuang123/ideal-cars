"use client";

import { useState, useTransition } from "react";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Button from "@/components/ui/Button";
import type { ConsumerInformationNotice } from "@/types/car";
import type { VehicleRow } from "@/types/database";
import { DEFAULT_TRADER } from "@/lib/bcg-template";
import { updateVehicleCin } from "./actions";

function defaultsFromVehicle(v: VehicleRow): ConsumerInformationNotice {
  return {
    trader: { ...DEFAULT_TRADER },
    cashPrice: Number(v.price),
    securityInterest: "None",
    engineCapacityCc: 0,
    odometer: v.mileage,
    odometerUnit: "km",
    hasRadio88to108: true,
    vin: v.vin ?? "",
    hasWofOrCof: true,
    wofOrCofExpiry: v.wof_expiry ?? "",
    hasVehicleLicence: true,
    vehicleLicenceExpiry: v.rego_expiry ?? "",
    isRegistered: true,
    regoPlate: "",
    nzFirstRegistered: "",
    isReregistered: false,
    operatingFuelType: v.fuel_type,
    rucApplies: v.fuel_type === "Diesel",
    outstandingRuc: false,
    overseasFirstRegistered: "",
    countryLastRegistered: "",
    importedAsDamaged: false,
  };
}

export default function CinForm({
  vehicle,
  initial,
}: {
  vehicle: VehicleRow;
  initial: ConsumerInformationNotice | null;
}) {
  const seed = initial ?? defaultsFromVehicle(vehicle);
  const [cin, setCin] = useState<ConsumerInformationNotice>(seed);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function set<K extends keyof ConsumerInformationNotice>(
    key: K,
    value: ConsumerInformationNotice[K],
  ) {
    setCin((prev) => ({ ...prev, [key]: value }));
  }
  function setTrader<K extends keyof ConsumerInformationNotice["trader"]>(
    key: K,
    value: ConsumerInformationNotice["trader"][K],
  ) {
    setCin((prev) => ({ ...prev, trader: { ...prev.trader, [key]: value } }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const res = await updateVehicleCin(vehicle.id, cin);
      if (res?.error) setError(res.error);
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <fieldset>
        <legend className="mb-3 text-lg font-bold text-navy">Trader</legend>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Trader name"
            value={cin.trader.name}
            onChange={(e) => setTrader("name", e.target.value)}
          />
          <Input
            label="Address"
            value={cin.trader.address}
            onChange={(e) => setTrader("address", e.target.value)}
          />
          <Input
            label="Phone"
            value={cin.trader.phone ?? ""}
            onChange={(e) => setTrader("phone", e.target.value)}
          />
          <Input
            label="Contact person"
            value={cin.trader.contactPerson ?? ""}
            onChange={(e) => setTrader("contactPerson", e.target.value)}
          />
          <Input
            label="Trader registration #"
            value={cin.trader.traderRegistrationNumber}
            onChange={(e) =>
              setTrader("traderRegistrationNumber", e.target.value)
            }
          />
          <BoolField
            label="Registered trader"
            value={cin.trader.isRegisteredTrader}
            onChange={(v) => setTrader("isRegisteredTrader", v)}
          />
        </div>
      </fieldset>

      <fieldset>
        <legend className="mb-3 text-lg font-bold text-navy">Sale</legend>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Cash price (NZD)"
            type="number"
            min={0}
            step={100}
            value={cin.cashPrice}
            onChange={(e) => set("cashPrice", Number(e.target.value))}
          />
          <Input
            label="Security interest"
            value={cin.securityInterest}
            onChange={(e) => set("securityInterest", e.target.value)}
          />
        </div>
      </fieldset>

      <fieldset>
        <legend className="mb-3 text-lg font-bold text-navy">
          Vehicle identification
        </legend>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="VIN"
            value={cin.vin}
            onChange={(e) => set("vin", e.target.value)}
          />
          <Input
            label="Engine capacity (cc)"
            type="number"
            min={0}
            value={cin.engineCapacityCc}
            onChange={(e) => set("engineCapacityCc", Number(e.target.value))}
          />
          <Input
            label="Odometer"
            type="number"
            min={0}
            value={cin.odometer}
            onChange={(e) => set("odometer", Number(e.target.value))}
          />
          <Select
            label="Odometer unit"
            value={cin.odometerUnit}
            onChange={(e) =>
              set("odometerUnit", e.target.value as "km" | "miles")
            }
          >
            <option value="km">km</option>
            <option value="miles">miles</option>
          </Select>
          <BoolField
            label="Radio 88-108 MHz"
            value={cin.hasRadio88to108}
            onChange={(v) => set("hasRadio88to108", v)}
          />
        </div>
      </fieldset>

      <fieldset>
        <legend className="mb-3 text-lg font-bold text-navy">
          WoF / Licence / Registration
        </legend>
        <div className="grid gap-4 sm:grid-cols-2">
          <BoolField
            label="Has WoF / CoF"
            value={cin.hasWofOrCof}
            onChange={(v) => set("hasWofOrCof", v)}
          />
          <Input
            label="WoF / CoF expiry"
            placeholder="dd/mm/yyyy"
            value={cin.wofOrCofExpiry}
            onChange={(e) => set("wofOrCofExpiry", e.target.value)}
          />
          <BoolField
            label="Has vehicle licence"
            value={cin.hasVehicleLicence}
            onChange={(v) => set("hasVehicleLicence", v)}
          />
          <Input
            label="Vehicle licence expiry"
            placeholder="dd/mm/yyyy"
            value={cin.vehicleLicenceExpiry}
            onChange={(e) => set("vehicleLicenceExpiry", e.target.value)}
          />
          <BoolField
            label="Is registered"
            value={cin.isRegistered}
            onChange={(v) => set("isRegistered", v)}
          />
          <Input
            label="Rego plate"
            value={cin.regoPlate}
            onChange={(e) => set("regoPlate", e.target.value)}
          />
          <Input
            label="NZ first registered"
            placeholder="dd/mm/yyyy"
            value={cin.nzFirstRegistered}
            onChange={(e) => set("nzFirstRegistered", e.target.value)}
          />
          <BoolField
            label="Re-registered"
            value={cin.isReregistered}
            onChange={(v) => set("isReregistered", v)}
          />
        </div>
      </fieldset>

      <fieldset>
        <legend className="mb-3 text-lg font-bold text-navy">Fuel & RUC</legend>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Operating fuel type"
            value={cin.operatingFuelType}
            onChange={(e) => set("operatingFuelType", e.target.value)}
          />
          <BoolField
            label="RUC applies"
            value={cin.rucApplies}
            onChange={(v) => set("rucApplies", v)}
          />
          <BoolField
            label="Outstanding RUC"
            value={cin.outstandingRuc}
            onChange={(v) => set("outstandingRuc", v)}
          />
        </div>
      </fieldset>

      <fieldset>
        <legend className="mb-3 text-lg font-bold text-navy">Import</legend>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Overseas first registered"
            value={cin.overseasFirstRegistered}
            onChange={(e) => set("overseasFirstRegistered", e.target.value)}
          />
          <Input
            label="Country last registered"
            value={cin.countryLastRegistered}
            onChange={(e) => set("countryLastRegistered", e.target.value)}
          />
          <BoolField
            label="Imported as damaged"
            value={cin.importedAsDamaged}
            onChange={(v) => set("importedAsDamaged", v)}
          />
        </div>
      </fieldset>

      <Button type="submit" size="lg" disabled={pending}>
        {pending ? "Saving..." : "Save CIN"}
      </Button>
    </form>
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
