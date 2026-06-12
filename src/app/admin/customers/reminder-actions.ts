"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import {
  REMINDER_TYPES,
  reminderKey,
  type ReminderType,
} from "@/lib/reminder-settings";

export async function setReminderEnabled(
  type: ReminderType,
  enabled: boolean,
): Promise<{ ok?: true; error?: string }> {
  if (!REMINDER_TYPES.includes(type)) {
    return { error: "Unknown reminder type" };
  }

  const supabase = createClient();

  // RLS silently matches 0 rows when the session is stale — fail loudly
  // instead so the toggle never reports a fake success.
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: "Session expired — please sign in again." };
  }

  const { error } = await supabase
    .from("site_content")
    .upsert(
      { key: reminderKey(type), value: enabled ? "true" : "false" },
      { onConflict: "key" },
    );
  if (error) return { error: error.message };

  revalidatePath("/admin/customers");
  return { ok: true };
}
