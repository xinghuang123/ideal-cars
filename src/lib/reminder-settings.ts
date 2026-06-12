import type { SupabaseClient } from "@supabase/supabase-js";

export const REMINDER_TYPES = ["service", "wof", "rego"] as const;
export type ReminderType = (typeof REMINDER_TYPES)[number];

export const REMINDER_LABELS: Record<
  ReminderType,
  { label: string; description: string }
> = {
  service: {
    label: "Service due reminders",
    description: "Emailed when a vehicle's next service date is approaching.",
  },
  wof: {
    label: "WoF expiry reminders",
    description: "Emailed before a vehicle's Warrant of Fitness expires.",
  },
  rego: {
    label: "Rego expiry reminders",
    description: "Emailed before a vehicle's registration expires.",
  },
};

export function reminderKey(type: ReminderType): string {
  return `reminder_${type}_enabled`;
}

export type ReminderSettings = Record<ReminderType, boolean>;

/**
 * Reads the reminder toggles from site_content. Keys that have never been
 * set default to enabled, which preserves the original always-on behavior.
 */
export async function getReminderSettings(
  client: SupabaseClient,
): Promise<ReminderSettings> {
  const settings: ReminderSettings = { service: true, wof: true, rego: true };
  const { data } = await client
    .from("site_content")
    .select("key, value")
    .in(
      "key",
      REMINDER_TYPES.map((t) => reminderKey(t)),
    );
  for (const row of (data ?? []) as { key: string; value: string }[]) {
    for (const t of REMINDER_TYPES) {
      if (row.key === reminderKey(t)) settings[t] = row.value !== "false";
    }
  }
  return settings;
}
