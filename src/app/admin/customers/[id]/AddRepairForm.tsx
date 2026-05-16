"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { addRepairRecord } from "../actions";

const REPAIR_CATEGORIES = [
  "Engine",
  "Transmission",
  "Brakes",
  "Suspension",
  "Electrical",
  "Air Conditioning",
  "Cooling System",
  "Fuel System",
  "Body & Panel",
  "Other",
];

const today = () => new Date().toISOString().slice(0, 10);
const emptyValues = () => ({
  service_date: today(),
  service_type: REPAIR_CATEGORIES[0],
  mileage: "",
  diagnosis: "",
  work_done: "",
  parts_cost: "",
  labour_cost: "",
  cost: "",
  warranty_until: "",
  performed_by: "Ideal Cars",
});

export default function AddRepairForm({
  customerVehicleId,
}: {
  customerVehicleId: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [values, setValues] = useState(emptyValues());

  function update<K extends keyof ReturnType<typeof emptyValues>>(
    key: K,
    v: string,
  ) {
    setValues((prev) => {
      const next = { ...prev, [key]: v };
      // Auto-fill total cost from parts + labour while the user hasn't
      // overridden it. If the user edits `cost` directly, we stop tracking.
      if (key === "parts_cost" || key === "labour_cost") {
        const p = Number(key === "parts_cost" ? v : prev.parts_cost) || 0;
        const l = Number(key === "labour_cost" ? v : prev.labour_cost) || 0;
        if (p > 0 || l > 0) {
          next.cost = (p + l).toFixed(2);
        }
      }
      return next;
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const res = await addRepairRecord({
      customerVehicleId,
      service_date: values.service_date,
      service_type: values.service_type,
      mileage: values.mileage ? Number(values.mileage) : null,
      diagnosis: values.diagnosis.trim() || null,
      work_done: values.work_done.trim() || null,
      parts_cost: values.parts_cost ? Number(values.parts_cost) : null,
      labour_cost: values.labour_cost ? Number(values.labour_cost) : null,
      cost: values.cost ? Number(values.cost) : null,
      warranty_until: values.warranty_until || null,
      performed_by: values.performed_by.trim() || null,
    });

    setSubmitting(false);
    if (res.error) {
      setError(res.error);
      return;
    }

    setValues(emptyValues());
    setOpen(false);
    router.refresh();
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-sm font-medium text-accent hover:underline"
      >
        + Add repair record
      </button>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="grid grid-cols-1 gap-3 rounded-lg border border-silver bg-gray-50 p-4 sm:grid-cols-2"
    >
      <Input
        label="Repair date"
        type="date"
        value={values.service_date}
        onChange={(e) => update("service_date", e.target.value)}
        required
      />
      <div>
        <label className="mb-1.5 block text-sm font-medium text-navy">
          Category
        </label>
        <select
          value={values.service_type}
          onChange={(e) => update("service_type", e.target.value)}
          className="w-full rounded-lg border border-silver bg-white px-3 py-2.5 text-sm text-navy focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30"
        >
          {REPAIR_CATEGORIES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </div>
      <Input
        label="Mileage (km)"
        type="number"
        min={0}
        value={values.mileage}
        onChange={(e) => update("mileage", e.target.value)}
      />
      <Input
        label="Performed by"
        value={values.performed_by}
        onChange={(e) => update("performed_by", e.target.value)}
      />
      <div className="sm:col-span-2">
        <label className="mb-1.5 block text-sm font-medium text-navy">
          Diagnosis (what was wrong)
        </label>
        <textarea
          rows={2}
          value={values.diagnosis}
          onChange={(e) => update("diagnosis", e.target.value)}
          className="w-full rounded-lg border border-silver bg-white px-3 py-2 text-sm text-navy focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30"
        />
      </div>
      <div className="sm:col-span-2">
        <label className="mb-1.5 block text-sm font-medium text-navy">
          Work done (parts replaced, repairs performed)
        </label>
        <textarea
          rows={2}
          value={values.work_done}
          onChange={(e) => update("work_done", e.target.value)}
          className="w-full rounded-lg border border-silver bg-white px-3 py-2 text-sm text-navy focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30"
        />
      </div>
      <Input
        label="Parts cost (NZD)"
        type="number"
        min={0}
        step={0.01}
        value={values.parts_cost}
        onChange={(e) => update("parts_cost", e.target.value)}
      />
      <Input
        label="Labour cost (NZD)"
        type="number"
        min={0}
        step={0.01}
        value={values.labour_cost}
        onChange={(e) => update("labour_cost", e.target.value)}
      />
      <Input
        label="Total cost (NZD)"
        type="number"
        min={0}
        step={0.01}
        value={values.cost}
        onChange={(e) => update("cost", e.target.value)}
      />
      <Input
        label="Warranty until"
        type="date"
        value={values.warranty_until}
        onChange={(e) => update("warranty_until", e.target.value)}
      />
      {error && (
        <div className="sm:col-span-2 rounded-lg border border-red-200 bg-red-50 p-2 text-sm text-red-700">
          {error}
        </div>
      )}
      <div className="sm:col-span-2 flex justify-end gap-2">
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="rounded-md border border-silver px-3 py-1.5 text-sm font-medium text-silver-dark hover:bg-white"
        >
          Cancel
        </button>
        <Button type="submit" disabled={submitting}>
          {submitting ? "Saving..." : "Save repair"}
        </Button>
      </div>
    </form>
  );
}
