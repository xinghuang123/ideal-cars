import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import type { FinanceBenefitRow } from "@/types/database";

const FALLBACK_BENEFITS: FinanceBenefitRow[] = [
  {
    id: "fallback-1",
    icon: "percent",
    title: "Competitive Rates",
    description:
      "We work with multiple lenders to find you the best interest rates available, ensuring you get the most affordable repayments.",
    display_order: 0,
    is_active: true,
    created_at: "",
    updated_at: "",
  },
  {
    id: "fallback-2",
    icon: "calendar",
    title: "Flexible Terms",
    description:
      "Choose a loan term from 1 to 5 years to suit your budget. Adjust your deposit and repayment schedule to fit your lifestyle.",
    display_order: 1,
    is_active: true,
    created_at: "",
    updated_at: "",
  },
  {
    id: "fallback-3",
    icon: "zap",
    title: "Quick Approval",
    description:
      "Our streamlined application process means you can get pre-approved quickly, often within the same day.",
    display_order: 2,
    is_active: true,
    created_at: "",
    updated_at: "",
  },
  {
    id: "fallback-4",
    icon: "users",
    title: "All Credit Types",
    description:
      "Whether you have excellent credit or are rebuilding, we have finance options available. Everyone deserves a fair go.",
    display_order: 3,
    is_active: true,
    created_at: "",
    updated_at: "",
  },
];

export const getActiveFinanceBenefits = cache(
  async (): Promise<FinanceBenefitRow[]> => {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("finance_benefits")
        .select("*")
        .eq("is_active", true)
        .order("display_order", { ascending: true });
      if (error) throw error;
      const rows = (data ?? []) as FinanceBenefitRow[];
      return rows.length > 0 ? rows : FALLBACK_BENEFITS;
    } catch (e) {
      console.error("[finance-benefits] failed to load, using fallback", e);
      return FALLBACK_BENEFITS;
    }
  },
);

export const getAllFinanceBenefits = cache(
  async (): Promise<FinanceBenefitRow[]> => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("finance_benefits")
      .select("*")
      .order("display_order", { ascending: true });
    if (error) {
      console.error("[finance-benefits] admin fetch failed", error);
      return [];
    }
    return (data ?? []) as FinanceBenefitRow[];
  },
);
