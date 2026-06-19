import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import type { AboutValueRow } from "@/types/database";

const FALLBACK_VALUES: AboutValueRow[] = [
  {
    id: "fallback-1",
    icon: "eye",
    title: "Transparency",
    description:
      "No hidden fees, no surprises. We believe in honest pricing and clear communication at every step of the process.",
    display_order: 0,
    is_active: true,
    created_at: "",
    updated_at: "",
  },
  {
    id: "fallback-2",
    icon: "award",
    title: "Quality",
    description:
      "Every vehicle we sell is thoroughly inspected and comes with a comprehensive vehicle history. We stand behind what we sell.",
    display_order: 1,
    is_active: true,
    created_at: "",
    updated_at: "",
  },
  {
    id: "fallback-3",
    icon: "heart",
    title: "Customer First",
    description:
      "Your satisfaction is our priority. We listen to your needs and work hard to find the perfect vehicle and deal for you.",
    display_order: 2,
    is_active: true,
    created_at: "",
    updated_at: "",
  },
  {
    id: "fallback-4",
    icon: "users",
    title: "Community",
    description:
      "We are proud to be part of the local community. We support local events and charities, and treat every customer like family.",
    display_order: 3,
    is_active: true,
    created_at: "",
    updated_at: "",
  },
];

/** Active values for the public /about page, in display order. */
export const getActiveAboutValues = cache(async (): Promise<AboutValueRow[]> => {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("about_values")
      .select("*")
      .eq("is_active", true)
      .order("display_order", { ascending: true });
    if (error) throw error;
    const rows = (data ?? []) as AboutValueRow[];
    return rows.length > 0 ? rows : FALLBACK_VALUES;
  } catch (e) {
    console.error("[about-values] failed to load, using fallback", e);
    return FALLBACK_VALUES;
  }
});

/** All values (active + inactive) for the admin manager, in display order. */
export const getAllAboutValues = cache(async (): Promise<AboutValueRow[]> => {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("about_values")
    .select("*")
    .order("display_order", { ascending: true });
  if (error) {
    console.error("[about-values] admin fetch failed", error);
    return [];
  }
  return (data ?? []) as AboutValueRow[];
});
