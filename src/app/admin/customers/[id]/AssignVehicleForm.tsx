"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { assignDealerVehicleToCustomer } from "../actions";

interface Props {
  customerId: string;
  availableVehicles: {
    id: string;
    year: number;
    make: string;
    model: string;
    stock_number: string | null;
  }[];
}

export default function AssignVehicleForm({ customerId, availableVehicles }: Props) {
  const router = useRouter();
  const [vehicleId, setVehicleId] = useState("");
  const [purchaseDate, setPurchaseDate] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!vehicleId) {
      setError("Pick a vehicle.");
      return;
    }
    setError(null);
    setSubmitting(true);
    const res = await assignDealerVehicleToCustomer({
      customerId,
      purchasedVehicleId: vehicleId,
      purchaseDate: purchaseDate || null,
    });
    setSubmitting(false);

    if (res.error) {
      setError(res.error);
      return;
    }
    setVehicleId("");
    setPurchaseDate("");
    router.refresh();
  }

  if (availableVehicles.length === 0) {
    return (
      <p className="text-sm text-silver-dark">
        No vehicles currently in stock are available to assign.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      <div className="sm:col-span-2">
        <label className="mb-1.5 block text-sm font-medium text-navy">
          Vehicle from inventory
        </label>
        <select
          value={vehicleId}
          onChange={(e) => setVehicleId(e.target.value)}
          required
          className="w-full rounded-lg border border-silver bg-white px-3 py-2.5 text-sm text-navy focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30"
        >
          <option value="">— Select a vehicle —</option>
          {availableVehicles.map((v) => (
            <option key={v.id} value={v.id}>
              {v.year} {v.make} {v.model}
              {v.stock_number ? ` (#${v.stock_number})` : ""}
            </option>
          ))}
        </select>
      </div>
      <Input
        label="Purchase date"
        type="date"
        value={purchaseDate}
        onChange={(e) => setPurchaseDate(e.target.value)}
      />
      {error && (
        <div className="sm:col-span-3 rounded-lg border border-red-200 bg-red-50 p-2 text-sm text-red-700">
          {error}
        </div>
      )}
      <div className="sm:col-span-3 flex justify-end">
        <Button type="submit" disabled={submitting}>
          {submitting ? "Assigning..." : "Assign vehicle"}
        </Button>
      </div>
    </form>
  );
}
