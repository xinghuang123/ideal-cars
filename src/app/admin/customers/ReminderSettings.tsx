"use client";

import { useState, useTransition } from "react";
import {
  REMINDER_TYPES,
  REMINDER_LABELS,
  type ReminderType,
  type ReminderSettings as Settings,
} from "@/lib/reminder-settings";
import { setReminderEnabled } from "./reminder-actions";

export default function ReminderSettings({ initial }: { initial: Settings }) {
  const [settings, setSettings] = useState<Settings>(initial);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function toggle(type: ReminderType) {
    const next = !settings[type];
    setSettings((s) => ({ ...s, [type]: next }));
    setError(null);
    startTransition(async () => {
      const result = await setReminderEnabled(type, next);
      if (result.error) {
        // Roll back the optimistic flip so the UI matches reality.
        setSettings((s) => ({ ...s, [type]: !next }));
        setError(result.error);
      }
    });
  }

  return (
    <div className="rounded-xl border border-silver bg-white p-5">
      <h2 className="text-lg font-semibold text-navy">
        Automatic email reminders
      </h2>
      <p className="mt-1 text-sm text-silver-dark">
        Runs daily at 9:00 AM (NZ time). Customers are emailed 30, 14, 7, and 1
        day(s) before each due date, and on the day itself.
      </p>
      {error && (
        <p className="mt-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}
      <ul className="mt-4 divide-y divide-silver/60">
        {REMINDER_TYPES.map((type) => (
          <li
            key={type}
            className="flex items-center justify-between gap-4 py-3"
          >
            <div>
              <p className="text-sm font-medium text-navy">
                {REMINDER_LABELS[type].label}
              </p>
              <p className="text-xs text-silver-dark">
                {REMINDER_LABELS[type].description}
              </p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={settings[type]}
              aria-label={REMINDER_LABELS[type].label}
              disabled={pending}
              onClick={() => toggle(type)}
              className={`relative h-6 w-11 shrink-0 rounded-full transition-colors disabled:opacity-60 ${
                settings[type] ? "bg-accent" : "bg-silver"
              }`}
            >
              <span
                className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${
                  settings[type] ? "left-[22px]" : "left-0.5"
                }`}
              />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
