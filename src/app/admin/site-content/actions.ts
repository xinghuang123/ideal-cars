"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { SITE_CONTENT_KEYS } from "@/lib/site-content-keys";

export async function updateSiteContent(
  values: Record<string, string>,
): Promise<{ ok?: true; error?: string }> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not signed in." };

  const role = (user.app_metadata as Record<string, unknown> | undefined)?.role;
  if (role !== "admin") return { error: "Admin only." };

  const rows = SITE_CONTENT_KEYS.filter((k) => k in values).map((k) => ({
    key: k,
    value: (values[k] ?? "").trim(),
    updated_by: user.id,
  }));

  if (rows.length === 0) return { ok: true };

  const { error } = await supabase
    .from("site_content")
    .upsert(rows, { onConflict: "key" });

  if (error) return { error: error.message };

  // Site content shows up everywhere — invalidate everything.
  revalidatePath("/", "layout");
  return { ok: true };
}
