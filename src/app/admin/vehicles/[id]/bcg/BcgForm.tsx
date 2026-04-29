"use client";

import { useState, useTransition } from "react";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Textarea from "@/components/ui/Textarea";
import Button from "@/components/ui/Button";
import type {
  BasicConditionGuide,
  BcgChecklistItem,
  BcgItemStatus,
} from "@/types/car";
import type { VehicleRow } from "@/types/database";
import { STANDARD_BCG_CHECKLIST, DEFAULT_TRADER } from "@/lib/bcg-template";
import { updateVehicleBcg } from "./actions";

const STATUSES: BcgItemStatus[] = ["OK", "Requires Attention", "N/A"];

function defaults(): BasicConditionGuide {
  return {
    inspectionDate: new Date().toISOString().slice(0, 10),
    inspectorName: DEFAULT_TRADER.contactPerson ?? "",
    publisherName: DEFAULT_TRADER.name,
    checklist: STANDARD_BCG_CHECKLIST.map((c) => ({
      ...c,
      status: "OK" as BcgItemStatus,
    })),
    tyreDepths: { frontLeft: 5, frontRight: 5, rearLeft: 5, rearRight: 5 },
    interiorCondition: {
      seats: "Good",
      carpets: "Good",
      panels: "Good",
      dashboard: "Good",
    },
    bodyComments: "",
    underCarriageComments: "",
    generalComments: "",
    roadConditions: "Dry",
    bodyConditions: "Dry",
    engineTimingMechanism: "Timing Chain",
    camBeltReplaced: null,
    camBeltReplacedKms: null,
  };
}

function mergeWithStandard(existing: BasicConditionGuide): BasicConditionGuide {
  // Ensure every standard item exists; add missing as OK
  const byKey = new Map(
    existing.checklist.map((i) => [`${i.category}|${i.item}`, i]),
  );
  const mergedChecklist: BcgChecklistItem[] = STANDARD_BCG_CHECKLIST.map(
    (s) => {
      const found = byKey.get(`${s.category}|${s.item}`);
      return found ?? { ...s, status: "OK" };
    },
  );
  return { ...existing, checklist: mergedChecklist };
}

export default function BcgForm({
  vehicle,
  initial,
}: {
  vehicle: VehicleRow;
  initial: BasicConditionGuide | null;
}) {
  const [bcg, setBcg] = useState<BasicConditionGuide>(
    initial ? mergeWithStandard(initial) : defaults(),
  );
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function set<K extends keyof BasicConditionGuide>(
    key: K,
    value: BasicConditionGuide[K],
  ) {
    setBcg((prev) => ({ ...prev, [key]: value }));
  }

  function setChecklistItem(index: number, patch: Partial<BcgChecklistItem>) {
    setBcg((prev) => {
      const next = [...prev.checklist];
      next[index] = { ...next[index], ...patch };
      return { ...prev, checklist: next };
    });
  }

  function setTyre(
    key: keyof BasicConditionGuide["tyreDepths"],
    value: number,
  ) {
    setBcg((prev) => ({
      ...prev,
      tyreDepths: { ...prev.tyreDepths, [key]: value },
    }));
  }

  function setInterior(
    key: keyof BasicConditionGuide["interiorCondition"],
    value: string,
  ) {
    setBcg((prev) => ({
      ...prev,
      interiorCondition: { ...prev.interiorCondition, [key]: value },
    }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const res = await updateVehicleBcg(vehicle.id, bcg);
      if (res?.error) setError(res.error);
    });
  }

  // Group checklist by category for rendering
  const groups = bcg.checklist.reduce<Record<string, { item: BcgChecklistItem; index: number }[]>>(
    (acc, item, index) => {
      acc[item.category] = acc[item.category] ?? [];
      acc[item.category].push({ item, index });
      return acc;
    },
    {},
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <fieldset>
        <legend className="mb-3 text-lg font-bold text-navy">Inspection</legend>
        <div className="grid gap-4 sm:grid-cols-3">
          <Input
            label="Inspection date"
            type="date"
            value={bcg.inspectionDate}
            onChange={(e) => set("inspectionDate", e.target.value)}
          />
          <Input
            label="Inspector name"
            value={bcg.inspectorName}
            onChange={(e) => set("inspectorName", e.target.value)}
          />
          <Input
            label="Publisher"
            value={bcg.publisherName}
            onChange={(e) => set("publisherName", e.target.value)}
          />
        </div>
      </fieldset>

      <fieldset>
        <legend className="mb-3 text-lg font-bold text-navy">Checklist</legend>
        <div className="space-y-6">
          {Object.entries(groups).map(([category, items]) => (
            <div key={category}>
              <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-silver-dark">
                {category}
              </h3>
              <div className="overflow-hidden rounded-lg border border-silver bg-white">
                <table className="w-full">
                  <tbody className="divide-y divide-silver">
                    {items.map(({ item, index }) => (
                      <tr key={index}>
                        <td className="px-3 py-2 text-sm text-navy">
                          {item.item}
                        </td>
                        <td className="w-44 px-3 py-2">
                          <select
                            value={item.status}
                            onChange={(e) =>
                              setChecklistItem(index, {
                                status: e.target.value as BcgItemStatus,
                              })
                            }
                            className="w-full rounded-md border border-silver bg-white px-2 py-1 text-sm"
                          >
                            {STATUSES.map((s) => (
                              <option key={s} value={s}>
                                {s}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="px-3 py-2">
                          <input
                            type="text"
                            placeholder="Comment (optional)"
                            value={item.comment ?? ""}
                            onChange={(e) =>
                              setChecklistItem(index, {
                                comment: e.target.value || undefined,
                              })
                            }
                            className="w-full rounded-md border border-silver bg-white px-2 py-1 text-sm"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend className="mb-3 text-lg font-bold text-navy">Tyres (mm)</legend>
        <div className="grid gap-4 sm:grid-cols-5">
          <Input
            label="Front left"
            type="number"
            step={0.5}
            min={0}
            value={bcg.tyreDepths.frontLeft}
            onChange={(e) => setTyre("frontLeft", Number(e.target.value))}
          />
          <Input
            label="Front right"
            type="number"
            step={0.5}
            min={0}
            value={bcg.tyreDepths.frontRight}
            onChange={(e) => setTyre("frontRight", Number(e.target.value))}
          />
          <Input
            label="Rear left"
            type="number"
            step={0.5}
            min={0}
            value={bcg.tyreDepths.rearLeft}
            onChange={(e) => setTyre("rearLeft", Number(e.target.value))}
          />
          <Input
            label="Rear right"
            type="number"
            step={0.5}
            min={0}
            value={bcg.tyreDepths.rearRight}
            onChange={(e) => setTyre("rearRight", Number(e.target.value))}
          />
          <Input
            label="Spare"
            type="number"
            step={0.5}
            min={0}
            value={bcg.tyreDepths.spare ?? ""}
            onChange={(e) => {
              const v = e.target.value;
              setTyre("spare", v === "" ? (undefined as unknown as number) : Number(v));
            }}
          />
        </div>
      </fieldset>

      <fieldset>
        <legend className="mb-3 text-lg font-bold text-navy">Interior</legend>
        <div className="grid gap-4 sm:grid-cols-4">
          <Input
            label="Seats"
            value={bcg.interiorCondition.seats}
            onChange={(e) => setInterior("seats", e.target.value)}
          />
          <Input
            label="Carpets"
            value={bcg.interiorCondition.carpets}
            onChange={(e) => setInterior("carpets", e.target.value)}
          />
          <Input
            label="Panels"
            value={bcg.interiorCondition.panels}
            onChange={(e) => setInterior("panels", e.target.value)}
          />
          <Input
            label="Dashboard"
            value={bcg.interiorCondition.dashboard}
            onChange={(e) => setInterior("dashboard", e.target.value)}
          />
        </div>
      </fieldset>

      <fieldset>
        <legend className="mb-3 text-lg font-bold text-navy">Engine</legend>
        <div className="grid gap-4 sm:grid-cols-3">
          <Select
            label="Engine timing mechanism"
            value={bcg.engineTimingMechanism}
            onChange={(e) => set("engineTimingMechanism", e.target.value)}
          >
            <option value="Timing Chain">Timing Chain</option>
            <option value="Timing Belt">Timing Belt</option>
            <option value="Other">Other</option>
          </Select>
          <Select
            label="Cam belt replaced"
            value={
              bcg.camBeltReplaced === null
                ? ""
                : bcg.camBeltReplaced
                  ? "yes"
                  : "no"
            }
            onChange={(e) => {
              const v = e.target.value;
              set(
                "camBeltReplaced",
                v === "" ? null : v === "yes" ? true : false,
              );
            }}
          >
            <option value="">N/A</option>
            <option value="yes">Yes</option>
            <option value="no">No</option>
          </Select>
          <Input
            label="Cam belt replaced at (km)"
            type="number"
            min={0}
            value={bcg.camBeltReplacedKms ?? ""}
            onChange={(e) => {
              const v = e.target.value;
              set("camBeltReplacedKms", v === "" ? null : Number(v));
            }}
          />
        </div>
      </fieldset>

      <fieldset>
        <legend className="mb-3 text-lg font-bold text-navy">Conditions & Comments</legend>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Road conditions"
            value={bcg.roadConditions}
            onChange={(e) => set("roadConditions", e.target.value)}
          />
          <Input
            label="Body conditions"
            value={bcg.bodyConditions}
            onChange={(e) => set("bodyConditions", e.target.value)}
          />
        </div>
        <div className="mt-4 space-y-4">
          <Textarea
            label="Body comments"
            value={bcg.bodyComments}
            onChange={(e) => set("bodyComments", e.target.value)}
          />
          <Textarea
            label="Under-carriage comments"
            value={bcg.underCarriageComments}
            onChange={(e) => set("underCarriageComments", e.target.value)}
          />
          <Textarea
            label="General comments"
            value={bcg.generalComments}
            onChange={(e) => set("generalComments", e.target.value)}
          />
        </div>
      </fieldset>

      <Button type="submit" size="lg" disabled={pending}>
        {pending ? "Saving..." : "Save BCG"}
      </Button>
    </form>
  );
}
