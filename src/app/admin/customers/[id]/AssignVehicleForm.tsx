"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import {
  addExternalVehicleToCustomer,
  assignDealerVehicleToCustomer,
} from "../actions";

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

type Mode = "dealer" | "external";

export default function AssignVehicleForm({ customerId, availableVehicles }: Props) {
  const [mode, setMode] = useState<Mode>("dealer");

  return (
    <div className="space-y-4">
      <div
        role="tablist"
        aria-label="Vehicle source"
        className="inline-flex rounded-lg border border-silver bg-white p-1"
      >
        <TabButton
          active={mode === "dealer"}
          onClick={() => setMode("dealer")}
        >
          Dealer inventory
        </TabButton>
        <TabButton
          active={mode === "external"}
          onClick={() => setMode("external")}
        >
          External vehicle
        </TabButton>
      </div>

      {mode === "dealer" ? (
        <DealerForm customerId={customerId} availableVehicles={availableVehicles} />
      ) : (
        <ExternalForm customerId={customerId} />
      )}
    </div>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={`rounded-md px-3 py-1.5 text-sm font-medium transition ${
        active
          ? "bg-navy text-white"
          : "text-silver-dark hover:text-navy"
      }`}
    >
      {children}
    </button>
  );
}

function DealerForm({
  customerId,
  availableVehicles,
}: {
  customerId: string;
  availableVehicles: Props["availableVehicles"];
}) {
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

function ExternalForm({ customerId }: { customerId: string }) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [values, setValues] = useState({
    year: String(new Date().getFullYear()),
    make: "",
    model: "",
    rego: "",
    vin: "",
    colour: "",
    purchase_date: "",
    notes: "",
  });

  function update<K extends keyof typeof values>(key: K, v: string) {
    setValues((prev) => ({ ...prev, [key]: v }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const yearNum = Number(values.year);
    if (!Number.isFinite(yearNum) || yearNum < 1900 || yearNum > 2100) {
      setError("Enter a valid year.");
      return;
    }
    if (!values.make.trim() || !values.model.trim()) {
      setError("Make and model are required.");
      return;
    }

    setSubmitting(true);
    const res = await addExternalVehicleToCustomer({
      customerId,
      year: yearNum,
      make: values.make.trim(),
      model: values.model.trim(),
      rego: values.rego.trim() || null,
      vin: values.vin.trim() || null,
      colour: values.colour.trim() || null,
      purchase_date: values.purchase_date || null,
      notes: values.notes.trim() || null,
    });
    setSubmitting(false);

    if (res.error) {
      setError(res.error);
      return;
    }

    setValues({
      year: String(new Date().getFullYear()),
      make: "",
      model: "",
      rego: "",
      vin: "",
      colour: "",
      purchase_date: "",
      notes: "",
    });
    router.refresh();
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="grid grid-cols-1 gap-3 sm:grid-cols-3"
    >
      <p className="sm:col-span-3 text-xs text-silver-dark">
        For vehicles the customer did not buy from us (e.g. service-only customers).
        Not linked to dealer inventory.
      </p>
      <Input
        label="Year"
        type="number"
        min={1900}
        max={2100}
        value={values.year}
        onChange={(e) => update("year", e.target.value)}
        required
      />
      <Input
        label="Make"
        value={values.make}
        onChange={(e) => update("make", e.target.value)}
        required
      />
      <Input
        label="Model"
        value={values.model}
        onChange={(e) => update("model", e.target.value)}
        required
      />
      <Input
        label="Rego"
        value={values.rego}
        onChange={(e) => update("rego", e.target.value)}
      />
      <Input
        label="VIN"
        value={values.vin}
        onChange={(e) => update("vin", e.target.value)}
      />
      <Input
        label="Colour"
        value={values.colour}
        onChange={(e) => update("colour", e.target.value)}
      />
      <Input
        label="Purchase date"
        type="date"
        value={values.purchase_date}
        onChange={(e) => update("purchase_date", e.target.value)}
      />
      <div className="sm:col-span-3">
        <label className="mb-1.5 block text-sm font-medium text-navy">Notes</label>
        <textarea
          rows={2}
          value={values.notes}
          onChange={(e) => update("notes", e.target.value)}
          className="w-full rounded-lg border border-silver bg-white px-3 py-2 text-sm text-navy focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30"
        />
      </div>
      {error && (
        <div className="sm:col-span-3 rounded-lg border border-red-200 bg-red-50 p-2 text-sm text-red-700">
          {error}
        </div>
      )}
      <div className="sm:col-span-3 flex justify-end">
        <Button type="submit" disabled={submitting}>
          {submitting ? "Adding..." : "Add vehicle"}
        </Button>
      </div>
    </form>
  );
}
