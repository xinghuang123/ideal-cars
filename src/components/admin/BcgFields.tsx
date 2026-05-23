"use client";

import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Textarea from "@/components/ui/Textarea";
import type {
  BasicConditionGuide,
  BcgChecklistItem,
  BcgItemStatus,
} from "@/types/car";
import { STANDARD_BCG_CHECKLIST, DEFAULT_TRADER } from "@/lib/bcg-template";

const STATUSES: BcgItemStatus[] = ["OK", "Requires Attention", "N/A"];

export function defaultBcg(): BasicConditionGuide {
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

export function mergeBcgWithStandard(
  existing: BasicConditionGuide,
): BasicConditionGuide {
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

export default function BcgFields({
  value,
  onChange,
}: {
  value: BasicConditionGuide;
  onChange: (next: BasicConditionGuide) => void;
}) {
  function set<K extends keyof BasicConditionGuide>(
    key: K,
    val: BasicConditionGuide[K],
  ) {
    onChange({ ...value, [key]: val });
  }
  function setChecklistItem(index: number, patch: Partial<BcgChecklistItem>) {
    const next = [...value.checklist];
    next[index] = { ...next[index], ...patch };
    onChange({ ...value, checklist: next });
  }
  function setTyre(
    key: keyof BasicConditionGuide["tyreDepths"],
    val: number,
  ) {
    onChange({
      ...value,
      tyreDepths: { ...value.tyreDepths, [key]: val },
    });
  }
  function setInterior(
    key: keyof BasicConditionGuide["interiorCondition"],
    val: string,
  ) {
    onChange({
      ...value,
      interiorCondition: { ...value.interiorCondition, [key]: val },
    });
  }

  const groups = value.checklist.reduce<
    Record<string, { item: BcgChecklistItem; index: number }[]>
  >((acc, item, index) => {
    acc[item.category] = acc[item.category] ?? [];
    acc[item.category].push({ item, index });
    return acc;
  }, {});

  return (
    <div className="space-y-8">
      <fieldset>
        <legend className="mb-3 text-base font-bold text-navy">
          Inspection
        </legend>
        <div className="grid gap-4 sm:grid-cols-3">
          <Input
            label="Inspection date"
            type="date"
            value={value.inspectionDate}
            onChange={(e) => set("inspectionDate", e.target.value)}
          />
          <Input
            label="Inspector name"
            value={value.inspectorName}
            onChange={(e) => set("inspectorName", e.target.value)}
          />
          <Input
            label="Publisher"
            value={value.publisherName}
            onChange={(e) => set("publisherName", e.target.value)}
          />
        </div>
      </fieldset>

      <fieldset>
        <legend className="mb-3 text-base font-bold text-navy">
          Checklist
        </legend>
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
        <legend className="mb-3 text-base font-bold text-navy">
          Tyres (mm)
        </legend>
        <div className="grid gap-4 sm:grid-cols-5">
          <Input
            label="Front left"
            type="number"
            step={0.5}
            min={0}
            value={value.tyreDepths.frontLeft}
            onChange={(e) => setTyre("frontLeft", Number(e.target.value))}
          />
          <Input
            label="Front right"
            type="number"
            step={0.5}
            min={0}
            value={value.tyreDepths.frontRight}
            onChange={(e) => setTyre("frontRight", Number(e.target.value))}
          />
          <Input
            label="Rear left"
            type="number"
            step={0.5}
            min={0}
            value={value.tyreDepths.rearLeft}
            onChange={(e) => setTyre("rearLeft", Number(e.target.value))}
          />
          <Input
            label="Rear right"
            type="number"
            step={0.5}
            min={0}
            value={value.tyreDepths.rearRight}
            onChange={(e) => setTyre("rearRight", Number(e.target.value))}
          />
          <Input
            label="Spare"
            type="number"
            step={0.5}
            min={0}
            value={value.tyreDepths.spare ?? ""}
            onChange={(e) => {
              const v = e.target.value;
              setTyre(
                "spare",
                v === "" ? (undefined as unknown as number) : Number(v),
              );
            }}
          />
        </div>
      </fieldset>

      <fieldset>
        <legend className="mb-3 text-base font-bold text-navy">Interior</legend>
        <div className="grid gap-4 sm:grid-cols-4">
          <Input
            label="Seats"
            value={value.interiorCondition.seats}
            onChange={(e) => setInterior("seats", e.target.value)}
          />
          <Input
            label="Carpets"
            value={value.interiorCondition.carpets}
            onChange={(e) => setInterior("carpets", e.target.value)}
          />
          <Input
            label="Panels"
            value={value.interiorCondition.panels}
            onChange={(e) => setInterior("panels", e.target.value)}
          />
          <Input
            label="Dashboard"
            value={value.interiorCondition.dashboard}
            onChange={(e) => setInterior("dashboard", e.target.value)}
          />
        </div>
      </fieldset>

      <fieldset>
        <legend className="mb-3 text-base font-bold text-navy">Engine</legend>
        <div className="grid gap-4 sm:grid-cols-3">
          <Select
            label="Engine timing mechanism"
            value={value.engineTimingMechanism}
            onChange={(e) => set("engineTimingMechanism", e.target.value)}
          >
            <option value="Timing Chain">Timing Chain</option>
            <option value="Timing Belt">Timing Belt</option>
            <option value="Other">Other</option>
          </Select>
          <Select
            label="Cam belt replaced"
            value={
              value.camBeltReplaced === null
                ? ""
                : value.camBeltReplaced
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
            value={value.camBeltReplacedKms ?? ""}
            onChange={(e) => {
              const v = e.target.value;
              set("camBeltReplacedKms", v === "" ? null : Number(v));
            }}
          />
        </div>
      </fieldset>

      <fieldset>
        <legend className="mb-3 text-base font-bold text-navy">
          Conditions & Comments
        </legend>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Road conditions"
            value={value.roadConditions}
            onChange={(e) => set("roadConditions", e.target.value)}
          />
          <Input
            label="Body conditions"
            value={value.bodyConditions}
            onChange={(e) => set("bodyConditions", e.target.value)}
          />
        </div>
        <div className="mt-4 space-y-4">
          <Textarea
            label="Body comments"
            value={value.bodyComments}
            onChange={(e) => set("bodyComments", e.target.value)}
          />
          <Textarea
            label="Under-carriage comments"
            value={value.underCarriageComments}
            onChange={(e) => set("underCarriageComments", e.target.value)}
          />
          <Textarea
            label="General comments"
            value={value.generalComments}
            onChange={(e) => set("generalComments", e.target.value)}
          />
        </div>
      </fieldset>
    </div>
  );
}
