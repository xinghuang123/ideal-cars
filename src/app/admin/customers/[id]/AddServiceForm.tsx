"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { addServiceRecord } from "../actions";

const SERVICE_TYPES = [
  "Service",
  "Repair",
  "WoF",
  "Tyres",
  "Brakes",
  "Battery",
  "Cambelt",
  "Other",
];

export default function AddServiceForm({
  customerVehicleId,
}: {
  customerVehicleId: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [values, setValues] = useState({
    service_date: new Date().toISOString().slice(0, 10),
    service_type: "Service",
    mileage: "",
    description: "",
    cost: "",
    next_service_due_date: "",
    performed_by: "Ideal Cars",
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const res = await addServiceRecord({
      customerVehicleId,
      service_date: values.service_date,
      service_type: values.service_type,
      mileage: values.mileage ? Number(values.mileage) : null,
      description: values.description || null,
      cost: values.cost ? Number(values.cost) : null,
      next_service_due_date: values.next_service_due_date || null,
      performed_by: values.performed_by || null,
    });

    setSubmitting(false);
    if (res.error) {
      setError(res.error);
      return;
    }

    setOpen(false);
    setValues({
      ...values,
      mileage: "",
      description: "",
      cost: "",
      next_service_due_date: "",
    });
    router.refresh();
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-sm font-medium text-accent hover:underline"
      >
        + Add service record
      </button>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="grid grid-cols-1 gap-3 rounded-lg border border-silver bg-gray-50 p-4 sm:grid-cols-2"
    >
      <Input
        label="Service date"
        type="date"
        value={values.service_date}
        onChange={(e) => setValues({ ...values, service_date: e.target.value })}
        required
      />
      <div>
        <label className="mb-1.5 block text-sm font-medium text-navy">Type</label>
        <select
          value={values.service_type}
          onChange={(e) => setValues({ ...values, service_type: e.target.value })}
          className="w-full rounded-lg border border-silver bg-white px-3 py-2.5 text-sm text-navy focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30"
        >
          {SERVICE_TYPES.map((t) => (
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
        onChange={(e) => setValues({ ...values, mileage: e.target.value })}
      />
      <Input
        label="Cost (NZD)"
        type="number"
        min={0}
        step={0.01}
        value={values.cost}
        onChange={(e) => setValues({ ...values, cost: e.target.value })}
      />
      <Input
        label="Performed by"
        value={values.performed_by}
        onChange={(e) => setValues({ ...values, performed_by: e.target.value })}
      />
      <Input
        label="Next service due"
        type="date"
        value={values.next_service_due_date}
        onChange={(e) =>
          setValues({ ...values, next_service_due_date: e.target.value })
        }
      />
      <div className="sm:col-span-2">
        <label className="mb-1.5 block text-sm font-medium text-navy">
          Description / parts
        </label>
        <textarea
          rows={2}
          value={values.description}
          onChange={(e) => setValues({ ...values, description: e.target.value })}
          className="w-full rounded-lg border border-silver bg-white px-3 py-2 text-sm text-navy focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30"
        />
      </div>
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
          {submitting ? "Saving..." : "Save record"}
        </Button>
      </div>
    </form>
  );
}
