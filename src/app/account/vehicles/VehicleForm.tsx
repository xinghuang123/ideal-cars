"use client";

import { useState } from "react";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import {
  createCustomerVehicle,
  updateCustomerVehicle,
} from "./actions";

export interface VehicleFormValues {
  year: number;
  make: string;
  model: string;
  rego: string;
  vin: string;
  colour: string;
  purchase_date: string;
  last_service_date: string;
  last_service_mileage: string;
  next_service_due_date: string;
  last_wof_date: string;
  next_wof_due_date: string;
  rego_expiry_date: string;
  notes: string;
}

export const emptyVehicle: VehicleFormValues = {
  year: new Date().getFullYear(),
  make: "",
  model: "",
  rego: "",
  vin: "",
  colour: "",
  purchase_date: "",
  last_service_date: "",
  last_service_mileage: "",
  next_service_due_date: "",
  last_wof_date: "",
  next_wof_due_date: "",
  rego_expiry_date: "",
  notes: "",
};

interface Props {
  mode: "new" | "edit";
  vehicleId?: string;
  initial: VehicleFormValues;
}

export default function VehicleForm({ mode, vehicleId, initial }: Props) {
  const [values, setValues] = useState(initial);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function set<K extends keyof VehicleFormValues>(
    key: K,
    val: VehicleFormValues[K],
  ) {
    setValues((v) => ({ ...v, [key]: val }));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const fd = new FormData(e.currentTarget);
    const res =
      mode === "new"
        ? await createCustomerVehicle(fd)
        : await updateCustomerVehicle(vehicleId!, fd);

    if (res && "error" in res && res.error) {
      setSubmitting(false);
      setError(res.error);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 rounded-xl border border-silver bg-white p-6 shadow-sm"
    >
      <div>
        <h2 className="mb-3 text-sm font-semibold text-navy">Vehicle</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Input label="Year" name="year" type="number" min={1950} max={new Date().getFullYear() + 1} value={values.year} onChange={(e) => set("year", Number(e.target.value))} required />
          <Input label="Make" name="make" value={values.make} onChange={(e) => set("make", e.target.value)} required />
          <Input label="Model" name="model" value={values.model} onChange={(e) => set("model", e.target.value)} required />
          <Input label="Colour" name="colour" value={values.colour} onChange={(e) => set("colour", e.target.value)} />
          <Input label="Rego" name="rego" value={values.rego} onChange={(e) => set("rego", e.target.value.toUpperCase())} />
          <Input label="VIN" name="vin" value={values.vin} onChange={(e) => set("vin", e.target.value.toUpperCase())} />
        </div>
      </div>

      <div>
        <h2 className="mb-3 text-sm font-semibold text-navy">Service & compliance</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input label="Purchase date" name="purchase_date" type="date" value={values.purchase_date} onChange={(e) => set("purchase_date", e.target.value)} />
          <Input label="Last service date" name="last_service_date" type="date" value={values.last_service_date} onChange={(e) => set("last_service_date", e.target.value)} />
          <Input label="Last service mileage (km)" name="last_service_mileage" type="number" min={0} value={values.last_service_mileage} onChange={(e) => set("last_service_mileage", e.target.value)} />
          <Input label="Next service due" name="next_service_due_date" type="date" value={values.next_service_due_date} onChange={(e) => set("next_service_due_date", e.target.value)} />
          <Input label="Last WoF date" name="last_wof_date" type="date" value={values.last_wof_date} onChange={(e) => set("last_wof_date", e.target.value)} />
          <Input label="Next WoF due" name="next_wof_due_date" type="date" value={values.next_wof_due_date} onChange={(e) => set("next_wof_due_date", e.target.value)} />
          <Input label="Rego expiry" name="rego_expiry_date" type="date" value={values.rego_expiry_date} onChange={(e) => set("rego_expiry_date", e.target.value)} />
        </div>
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-navy" htmlFor="notes">
          Notes
        </label>
        <textarea
          id="notes"
          name="notes"
          rows={3}
          value={values.notes}
          onChange={(e) => set("notes", e.target.value)}
          className="w-full rounded-lg border border-silver bg-white px-4 py-2.5 text-navy placeholder:text-silver-dark focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30"
        />
      </div>

      {error && (
        <div role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="flex justify-end gap-3">
        <Button type="submit" disabled={submitting}>
          {submitting ? "Saving..." : mode === "new" ? "Add vehicle" : "Save changes"}
        </Button>
      </div>
    </form>
  );
}
