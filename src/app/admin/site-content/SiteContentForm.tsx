"use client";

import { useState } from "react";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import {
  type SiteContent,
  SITE_CONTENT_KEYS,
  FIELD_LABELS,
} from "@/lib/site-content-keys";
import { updateSiteContent } from "./actions";

export default function SiteContentForm({ initial }: { initial: SiteContent }) {
  const [values, setValues] = useState<Record<string, string>>(
    Object.fromEntries(SITE_CONTENT_KEYS.map((k) => [k, initial[k] ?? ""])),
  );
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  function set(key: string, val: string) {
    setValues((v) => ({ ...v, [key]: val }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    setSubmitting(true);
    const res = await updateSiteContent(values);
    setSubmitting(false);
    if ("error" in res && res.error) {
      setMessage({ type: "error", text: res.error });
    } else {
      setMessage({ type: "success", text: "Saved. Refresh any open pages to see changes." });
    }
  }

  const groups: Array<{ title: string; keys: (keyof SiteContent)[] }> = [
    {
      title: "Contact details",
      keys: ["phone", "email", "address"],
    },
    {
      title: "Opening hours",
      keys: ["hours_weekday", "hours_saturday", "hours_sunday"],
    },
    {
      title: "Marketing copy",
      keys: ["tagline", "hero_title", "hero_subtitle", "about_intro"],
    },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {groups.map((g) => (
        <div
          key={g.title}
          className="space-y-4 rounded-xl border border-silver bg-white p-6 shadow-sm"
        >
          <h2 className="text-sm font-semibold text-navy">{g.title}</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {g.keys.map((key) => {
              const meta = FIELD_LABELS[key];
              const k = String(key);
              if (meta.type === "textarea") {
                return (
                  <div key={k} className="sm:col-span-2">
                    <label className="mb-1.5 block text-sm font-medium text-navy">
                      {meta.label}
                    </label>
                    <textarea
                      rows={3}
                      value={values[k] ?? ""}
                      onChange={(e) => set(k, e.target.value)}
                      className="w-full rounded-lg border border-silver bg-white px-4 py-2.5 text-navy focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30"
                    />
                  </div>
                );
              }
              return (
                <Input
                  key={k}
                  label={meta.label}
                  value={values[k] ?? ""}
                  onChange={(e) => set(k, e.target.value)}
                />
              );
            })}
          </div>
        </div>
      ))}

      {message && (
        <div
          role="alert"
          className={`rounded-lg border p-3 text-sm ${
            message.type === "success"
              ? "border-green-200 bg-green-50 text-green-800"
              : "border-red-200 bg-red-50 text-red-700"
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="flex justify-end">
        <Button type="submit" disabled={submitting}>
          {submitting ? "Saving..." : "Save all"}
        </Button>
      </div>
    </form>
  );
}
