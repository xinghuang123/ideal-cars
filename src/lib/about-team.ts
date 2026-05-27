import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import type { AboutTeamMemberRow } from "@/types/database";

const FALLBACK_TEAM: AboutTeamMemberRow[] = [
  {
    id: "fallback-1",
    name: "James Mitchell",
    role: "Founder & Director",
    photo_url: null,
    display_order: 0,
    is_active: true,
    created_at: "",
    updated_at: "",
  },
  {
    id: "fallback-2",
    name: "Sarah Chen",
    role: "Sales Manager",
    photo_url: null,
    display_order: 1,
    is_active: true,
    created_at: "",
    updated_at: "",
  },
  {
    id: "fallback-3",
    name: "David Thompson",
    role: "Service Manager",
    photo_url: null,
    display_order: 2,
    is_active: true,
    created_at: "",
    updated_at: "",
  },
];

/** Active team members for the public /about page, in display order. */
export const getActiveAboutTeam = cache(
  async (): Promise<AboutTeamMemberRow[]> => {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("about_team_members")
        .select("*")
        .eq("is_active", true)
        .order("display_order", { ascending: true });
      if (error) throw error;
      const rows = (data ?? []) as AboutTeamMemberRow[];
      return rows.length > 0 ? rows : FALLBACK_TEAM;
    } catch (e) {
      console.error("[about-team] failed to load, using fallback", e);
      return FALLBACK_TEAM;
    }
  },
);

/** All team members (active + inactive) for the admin manager. */
export const getAllAboutTeam = cache(
  async (): Promise<AboutTeamMemberRow[]> => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("about_team_members")
      .select("*")
      .order("display_order", { ascending: true });
    if (error) {
      console.error("[about-team] admin fetch failed", error);
      return [];
    }
    return (data ?? []) as AboutTeamMemberRow[];
  },
);
