"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import type { AboutValueRow } from "@/types/database";
import {
  createAboutValue,
  updateAboutValue,
  deleteAboutValue,
  reorderAboutValue,
} from "./about-values-actions";

export default function AboutValuesManager({
  initialValues,
}: {
  initialValues: AboutValueRow[];
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
      const res = await createAboutValue();
      if (res.error) setError(res.error);
      refresh();
    });
  }

  function handleDelete(value: AboutValueRow) {
    if (!confirm("Delete this value?")) return;
    setError(null);
    setBusyId(value.id);
    startTransition(async () => {
      const res = await deleteAboutValue(value.id);
      setBusyId(null);
      if (res.error) setError(res.error);
      refresh();
    });
  }

  function handleReorder(value: AboutValueRow, direction: "up" | "down") {
    setError(null);
    setBusyId(value.id);
    startTransition(async () => {
      const res = await reorderAboutValue(value.id, direction);
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
            About page — Our Values
          </h2>
          <p className="mt-1 text-xs text-silver-dark">
            The principle cards shown on the /about page. Reorder with the
            arrows, hide a value with the Active toggle, or delete it entirely.
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleAdd}
          disabled={pending}
        >
          + Add Value
        </Button>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {initialValues.length === 0 ? (
        <p className="rounded-lg border border-silver bg-gray-50 p-8 text-center text-sm text-silver-dark">
          No values yet. Click &ldquo;Add Value&rdquo; to create one.
        </p>
      ) : (
        <ul className="space-y-3">
          {initialValues.map((value, idx) => (
            <ValueRow
              key={value.id}
              value={value}
              index={idx}
              total={initialValues.length}
              busy={pending && busyId === value.id}
              onDelete={() => handleDelete(value)}
              onMoveUp={() => handleReorder(value, "up")}
              onMoveDown={() => handleReorder(value, "down")}
              onSaved={refresh}
              onError={setError}
            />
          ))}
        </ul>
      )}
    </div>
  );
}

interface ValueRowProps {
  value: AboutValueRow;
  index: number;
  total: number;
  busy: boolean;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onSaved: () => void;
  onError: (msg: string | null) => void;
}

function ValueRow({
  value,
  index,
  total,
  busy,
  onDelete,
  onMoveUp,
  onMoveDown,
  onSaved,
  onError,
}: ValueRowProps) {
  const [title, setTitle] = useState(value.title);
  const [description, setDescription] = useState(value.description);
  const [isActive, setIsActive] = useState(value.is_active);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<number | null>(null);

  async function handleSave() {
    onError(null);
    setSaving(true);
    const res = await updateAboutValue(value.id, {
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
            Value {index + 1}
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

        <Input
          label="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
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
            {saving ? "Saving..." : "Save value"}
          </Button>
        </div>
      </div>
    </li>
  );
}
