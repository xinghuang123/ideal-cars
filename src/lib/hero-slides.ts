import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import type { HeroSlideRow } from "@/types/database";

const FALLBACK_SLIDES: HeroSlideRow[] = [
  {
    id: "fallback-1",
    image_url: null,
    heading: "Find Your Ideal Car",
    subheading: "Browse our quality selection of second-hand vehicles",
    button_text: "Browse Cars",
    button_href: "/buy",
    gradient_class: "bg-gradient-to-br from-navy-dark via-navy to-navy-light",
    display_order: 0,
    is_active: true,
    created_at: "",
    updated_at: "",
  },
];

/** Active slides for the public homepage carousel, in display order. */
export const getActiveHeroSlides = cache(async (): Promise<HeroSlideRow[]> => {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("hero_slides")
      .select("*")
      .eq("is_active", true)
      .order("display_order", { ascending: true });
    if (error) throw error;
    const rows = (data ?? []) as HeroSlideRow[];
    return rows.length > 0 ? rows : FALLBACK_SLIDES;
  } catch (e) {
    console.error("[hero-slides] failed to load, using fallback", e);
    return FALLBACK_SLIDES;
  }
});

/** All slides (active + inactive) for the admin manager, in display order. */
export const getAllHeroSlides = cache(async (): Promise<HeroSlideRow[]> => {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("hero_slides")
    .select("*")
    .order("display_order", { ascending: true });
  if (error) {
    console.error("[hero-slides] admin fetch failed", error);
    return [];
  }
  return (data ?? []) as HeroSlideRow[];
});
