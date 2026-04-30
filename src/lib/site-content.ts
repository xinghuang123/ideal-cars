import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { DEFAULTS, type SiteContent } from "./site-content-keys";

export type { SiteContent } from "./site-content-keys";
export { SITE_CONTENT_KEYS, FIELD_LABELS } from "./site-content-keys";

/** Cached for the duration of one request so multiple components can share. */
export const getSiteContent = cache(async (): Promise<SiteContent> => {
  try {
    const supabase = createClient();
    const { data } = await supabase.from("site_content").select("key, value");
    const overrides: Record<string, string> = {};
    for (const row of (data ?? []) as { key: string; value: string }[]) {
      overrides[row.key] = row.value;
    }
    return { ...DEFAULTS, ...overrides };
  } catch (e) {
    console.error("[site-content] failed to load, using defaults", e);
    return DEFAULTS;
  }
});
