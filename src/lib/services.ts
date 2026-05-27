import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import type { ServiceRow } from "@/types/database";

const FALLBACK_SERVICES: ServiceRow[] = [
  {
    id: "fallback-1",
    title: "Warrant of Fitness",
    description:
      "Get your WOF inspection done quickly and efficiently. We are NZTA-approved inspectors ensuring your vehicle meets all safety requirements.",
    icon: "shield-check",
    features: [
      "NZTA-approved inspection",
      "Quick turnaround",
      "Detailed report provided",
      "Re-inspection included",
    ],
    display_order: 1,
    is_active: true,
  },
  {
    id: "fallback-2",
    title: "Vehicle Servicing",
    description:
      "Regular servicing keeps your car running at its best. We service all makes and models with genuine or quality aftermarket parts.",
    icon: "wrench",
    features: [
      "Full & interim services",
      "All makes and models",
      "Genuine parts available",
      "Service book stamped",
    ],
    display_order: 2,
    is_active: true,
  },
  {
    id: "fallback-3",
    title: "Mechanical Repairs",
    description:
      "From minor fixes to major mechanical repairs, our experienced mechanics can diagnose and fix any issue with your vehicle.",
    icon: "cog",
    features: [
      "Engine & transmission",
      "Brakes & suspension",
      "Electrical diagnostics",
      "Free quotes available",
    ],
    display_order: 3,
    is_active: true,
  },
];

export const getActiveServices = cache(async (): Promise<ServiceRow[]> => {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("services")
      .select("*")
      .eq("is_active", true)
      .order("display_order", { ascending: true });
    if (error) throw error;
    const rows = (data ?? []) as ServiceRow[];
    return rows.length > 0 ? rows : FALLBACK_SERVICES;
  } catch (e) {
    console.error("[services] failed to load, using fallback", e);
    return FALLBACK_SERVICES;
  }
});

export const getAllServices = cache(async (): Promise<ServiceRow[]> => {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("services")
    .select("*")
    .order("display_order", { ascending: true });
  if (error) {
    console.error("[services] admin fetch failed", error);
    return [];
  }
  return (data ?? []) as ServiceRow[];
});
