"use client";

import { useState, useTransition } from "react";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Textarea from "@/components/ui/Textarea";
import Button from "@/components/ui/Button";
import {
  carMakes,
  bodyTypes,
  fuelTypes,
  transmissionTypes,
} from "@/data/makes";
import type { VehicleRow } from "@/types/database";
import { createVehicle, updateVehicle } from "./actions";

const driveTypes = ["FWD", "RWD", "AWD", "4WD"] as const;
const statuses = ["available", "special", "sold"] as const;

export default function VehicleForm({
  initial,
}: {
  initial?: VehicleRow;
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const isEdit = Boolean(initial);

  function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = isEdit
        ? await updateVehicle(initial!.id, formData)
        : await createVehicle(formData);
      if (result?.error) setError(result.error);
    });
  }

  return (
    <form action={handleSubmit} className="space-y-8">
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <fieldset>
        <legend className="mb-4 text-lg font-bold text-navy">
          Identification
        </legend>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Input
            label="Stock Number *"
            name="stock_number"
            defaultValue={initial?.stock_number}
            required
          />
          <Input
            label="VIN"
            name="vin"
            defaultValue={initial?.vin ?? ""}
            placeholder="17 characters"
            maxLength={17}
          />
          <Select
            label="Status *"
            name="status"
            defaultValue={initial?.status ?? "available"}
            required
          >
            {statuses.map((s) => (
              <option key={s} value={s}>
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </option>
            ))}
          </Select>
        </div>
      </fieldset>

      <fieldset>
        <legend className="mb-4 text-lg font-bold text-navy">Vehicle</legend>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Select
            label="Make *"
            name="make"
            defaultValue={initial?.make ?? ""}
            required
          >
            <option value="">Select make</option>
            {carMakes.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </Select>
          <Input
            label="Model *"
            name="model"
            defaultValue={initial?.model}
            required
          />
          <Input
            label="Year *"
            name="year"
            type="number"
            min={1990}
            max={new Date().getFullYear() + 1}
            defaultValue={initial?.year}
            required
          />
          <Input
            label="Price (NZD) *"
            name="price"
            type="number"
            min={0}
            step={100}
            defaultValue={initial?.price}
            required
          />
          <Input
            label="Mileage (km) *"
            name="mileage"
            type="number"
            min={0}
            defaultValue={initial?.mileage}
            required
          />
          <Input
            label="Colour *"
            name="colour"
            defaultValue={initial?.colour}
            required
          />
          <Select
            label="Body Type *"
            name="body_type"
            defaultValue={initial?.body_type ?? ""}
            required
          >
            <option value="">Select</option>
            {bodyTypes.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </Select>
          <Select
            label="Fuel Type *"
            name="fuel_type"
            defaultValue={initial?.fuel_type ?? ""}
            required
          >
            <option value="">Select</option>
            {fuelTypes.map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </Select>
          <Select
            label="Transmission *"
            name="transmission"
            defaultValue={initial?.transmission ?? ""}
            required
          >
            <option value="">Select</option>
            {transmissionTypes.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </Select>
          <Input
            label="Engine Size"
            name="engine_size"
            defaultValue={initial?.engine_size ?? ""}
            placeholder="e.g. 2.0L"
          />
          <Select
            label="Drive Type"
            name="drive_type"
            defaultValue={initial?.drive_type ?? ""}
          >
            <option value="">—</option>
            {driveTypes.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </Select>
          <Input
            label="Doors"
            name="doors"
            type="number"
            min={2}
            max={5}
            defaultValue={initial?.doors ?? ""}
          />
          <Input
            label="Seats"
            name="seats"
            type="number"
            min={2}
            max={8}
            defaultValue={initial?.seats ?? ""}
          />
          <Input
            label="WOF Expiry"
            name="wof_expiry"
            type="date"
            defaultValue={initial?.wof_expiry ?? ""}
          />
          <Input
            label="Rego Expiry"
            name="rego_expiry"
            type="date"
            defaultValue={initial?.rego_expiry ?? ""}
          />
        </div>
      </fieldset>

      <fieldset>
        <legend className="mb-4 text-lg font-bold text-navy">Details</legend>
        <div className="space-y-4">
          <Input
            label="Features (comma-separated)"
            name="features"
            defaultValue={initial?.features?.join(", ") ?? ""}
            placeholder="e.g. Bluetooth, Reversing Camera, Cruise Control"
          />
          <Textarea
            label="Description"
            name="description"
            rows={5}
            defaultValue={initial?.description ?? ""}
          />
        </div>
      </fieldset>

      <div className="flex gap-3">
        <Button type="submit" size="lg" disabled={pending}>
          {pending ? "Saving..." : isEdit ? "Save Changes" : "Create Vehicle"}
        </Button>
      </div>
    </form>
  );
}
