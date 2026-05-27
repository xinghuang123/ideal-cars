"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import type { ServiceRow } from "@/types/database";
import {
  createService,
  updateService,
  deleteService,
  reorderService,
} from "./services-actions";

const ICON_OPTIONS: { value: string; label: string; preview: string }[] = [
  { value: "shield-check", label: "Shield (S)", preview: "S" },
  { value: "wrench", label: "Wrench (W)", preview: "W" },
  { value: "cog", label: "Cog (M)", preview: "M" },
  { value: "circle", label: "Circle (T)", preview: "T" },
  { value: "search", label: "Search (P)", preview: "P" },
  { value: "zap", label: "Zap (E)", preview: "E" },
];

export default function ServicesManager({
  initialServices,
}: {
  initialServices: ServiceRow[];
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
      const res = await createService();
      if (res.error) setError(res.error);
      refresh();
    });
  }

  function handleDelete(svc: ServiceRow) {
    if (!confirm("Delete this service?")) return;
    setError(null);
    setBusyId(svc.id);
    startTransition(async () => {
      const res = await deleteService(svc.id);
      setBusyId(null);
      if (res.error) setError(res.error);
      refresh();
    });
  }

  function handleReorder(svc: ServiceRow, direction: "up" | "down") {
    setError(null);
    setBusyId(svc.id);
    startTransition(async () => {
      const res = await reorderService(svc.id, direction);
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
            Service &amp; Repairs page — Service cards
          </h2>
          <p className="mt-1 text-xs text-silver-dark">
            The service cards shown on /service. Features render as a check-list
            under the description. Reorder with the arrows.
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleAdd}
          disabled={pending}
        >
          + Add Service
        </Button>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {initialServices.length === 0 ? (
        <p className="rounded-lg border border-silver bg-gray-50 p-8 text-center text-sm text-silver-dark">
          No services yet. Click &ldquo;Add Service&rdquo; to create one.
        </p>
      ) : (
        <ul className="space-y-3">
          {initialServices.map((svc, idx) => (
            <ServiceRowEditor
              key={svc.id}
              service={svc}
              index={idx}
              total={initialServices.length}
              busy={pending && busyId === svc.id}
              onDelete={() => handleDelete(svc)}
              onMoveUp={() => handleReorder(svc, "up")}
              onMoveDown={() => handleReorder(svc, "down")}
              onSaved={refresh}
              onError={setError}
            />
          ))}
        </ul>
      )}
    </div>
  );
}

interface ServiceRowEditorProps {
  service: ServiceRow;
  index: number;
  total: number;
  busy: boolean;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onSaved: () => void;
  onError: (msg: string | null) => void;
}

function ServiceRowEditor({
  service,
  index,
  total,
  busy,
  onDelete,
  onMoveUp,
  onMoveDown,
  onSaved,
  onError,
}: ServiceRowEditorProps) {
  const [title, setTitle] = useState(service.title);
  const [description, setDescription] = useState(service.description);
  const [icon, setIcon] = useState(service.icon ?? "wrench");
  const [featuresText, setFeaturesText] = useState(
    service.features.join("\n"),
  );
  const [isActive, setIsActive] = useState(service.is_active);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<number | null>(null);

  async function handleSave() {
    onError(null);
    setSaving(true);
    const features = featuresText
      .split("\n")
      .map((f) => f.trim())
      .filter(Boolean);
    const res = await updateService(service.id, {
      title,
      description,
      icon,
      features,
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
            Service {index + 1}
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
            <select
              value={icon}
              onChange={(e) => setIcon(e.target.value)}
              className="w-full rounded-lg border border-silver bg-white px-4 py-2.5 text-navy focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30"
            >
              {ICON_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
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

        <div>
          <label className="mb-1.5 block text-sm font-medium text-navy">
            Features (one per line)
          </label>
          <textarea
            rows={4}
            value={featuresText}
            onChange={(e) => setFeaturesText(e.target.value)}
            placeholder="e.g.&#10;NZTA-approved inspection&#10;Quick turnaround"
            className="w-full rounded-lg border border-silver bg-white px-4 py-2.5 font-mono text-sm text-navy focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30"
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
            {saving ? "Saving..." : "Save service"}
          </Button>
        </div>
      </div>
    </li>
  );
}
