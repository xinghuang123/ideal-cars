"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import {
  FINANCE_ICON_OPTIONS,
  ServiceIconBadge,
} from "@/components/ui/ServiceIcon";
import type { FinanceBenefitRow } from "@/types/database";
import {
  createFinanceBenefit,
  updateFinanceBenefit,
  deleteFinanceBenefit,
  reorderFinanceBenefit,
} from "./finance-benefits-actions";

export default function FinanceBenefitsManager({
  initialBenefits,
}: {
  initialBenefits: FinanceBenefitRow[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  function refresh() {
    router.refresh();
  }

  function handleAdd() {
    setError(null);
    startTransition(async () => {
      const res = await createFinanceBenefit();
      if (res.error) setError(res.error);
      refresh();
    });
  }

  function handleDelete(benefit: FinanceBenefitRow) {
    if (!confirm("Delete this benefit?")) return;
    setError(null);
    setBusyId(benefit.id);
    startTransition(async () => {
      const res = await deleteFinanceBenefit(benefit.id);
      setBusyId(null);
      if (res.error) setError(res.error);
      refresh();
    });
  }

  function handleReorder(
    benefit: FinanceBenefitRow,
    direction: "up" | "down",
  ) {
    setError(null);
    setBusyId(benefit.id);
    startTransition(async () => {
      const res = await reorderFinanceBenefit(benefit.id, direction);
      setBusyId(null);
      if (res.error) setError(res.error);
      refresh();
    });
  }

  return (
    <div className="space-y-4 rounded-xl border border-silver bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-navy">
            Finance page — Benefit cards
          </h2>
          <p className="mt-1 text-xs text-silver-dark">
            The four cards under &ldquo;Why Finance With Us&rdquo;. Pick a
            built-in icon for each card from the dropdown.
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleAdd}
          disabled={pending}
        >
          + Add Benefit
        </Button>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {initialBenefits.length === 0 ? (
        <p className="rounded-lg border border-silver bg-gray-50 p-8 text-center text-sm text-silver-dark">
          No benefits yet. Click &ldquo;Add Benefit&rdquo; to create one.
        </p>
      ) : (
        <ul className="space-y-3">
          {initialBenefits.map((benefit, idx) => (
            <BenefitRow
              key={benefit.id}
              benefit={benefit}
              index={idx}
              total={initialBenefits.length}
              busy={pending && busyId === benefit.id}
              onDelete={() => handleDelete(benefit)}
              onMoveUp={() => handleReorder(benefit, "up")}
              onMoveDown={() => handleReorder(benefit, "down")}
              onSaved={refresh}
              onError={setError}
            />
          ))}
        </ul>
      )}
    </div>
  );
}

interface BenefitRowProps {
  benefit: FinanceBenefitRow;
  index: number;
  total: number;
  busy: boolean;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onSaved: () => void;
  onError: (msg: string | null) => void;
}

function BenefitRow({
  benefit,
  index,
  total,
  busy,
  onDelete,
  onMoveUp,
  onMoveDown,
  onSaved,
  onError,
}: BenefitRowProps) {
  const [icon, setIcon] = useState(benefit.icon);
  const [title, setTitle] = useState(benefit.title);
  const [description, setDescription] = useState(benefit.description);
  const [isActive, setIsActive] = useState(benefit.is_active);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<number | null>(null);

  async function handleSave() {
    onError(null);
    setSaving(true);
    const res = await updateFinanceBenefit(benefit.id, {
      icon,
      title,
      description,
      is_active: isActive,
    });
    setSaving(false);
    if (res.error) {
      onError(res.error);
      return;
    }
    setSavedAt(Date.now());
    onSaved();
  }

  const showSavedFlash = savedAt !== null && Date.now() - savedAt < 2500;

  return (
    <li className="rounded-lg border border-silver bg-gray-50 p-4">
      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-silver-dark">
            Benefit {index + 1}
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onMoveUp}
              disabled={busy || index === 0}
              className="rounded-md border border-silver bg-white px-2 py-1 text-xs text-navy hover:border-accent hover:text-accent disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="Move up"
            >
              ↑
            </button>
            <button
              type="button"
              onClick={onMoveDown}
              disabled={busy || index === total - 1}
              className="rounded-md border border-silver bg-white px-2 py-1 text-xs text-navy hover:border-accent hover:text-accent disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="Move down"
            >
              ↓
            </button>
            <label className="flex items-center gap-1.5 text-xs text-navy">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="h-4 w-4 rounded border-silver text-accent focus:ring-accent/30"
              />
              Active
            </label>
            <button
              type="button"
              onClick={onDelete}
              disabled={busy}
              className="rounded-md border border-red-200 bg-white px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
            >
              Delete
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Input
            label="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <div>
            <label className="mb-1.5 block text-sm font-medium text-navy">
              Icon
            </label>
            <div className="flex items-center gap-3">
              <ServiceIconBadge
                icon={icon}
                className="h-11 w-11 shrink-0"
                glyphClassName="h-5 w-5"
              />
              <select
                value={icon}
                onChange={(e) => setIcon(e.target.value)}
                className="w-full rounded-lg border border-silver bg-white px-4 py-2.5 text-navy focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30"
              >
                {FINANCE_ICON_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-navy">
            Description
          </label>
          <textarea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full rounded-lg border border-silver bg-white px-4 py-2.5 text-navy focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30"
          />
        </div>

        <div className="flex items-center justify-end gap-3">
          {showSavedFlash && (
            <span className="text-xs text-green-700">Saved.</span>
          )}
          <Button
            type="button"
            size="sm"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? "Saving..." : "Save benefit"}
          </Button>
        </div>
      </div>
    </li>
  );
}
