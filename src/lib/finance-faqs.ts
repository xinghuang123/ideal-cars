import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import type { FinanceFaqRow } from "@/types/database";

const FALLBACK_FAQS: FinanceFaqRow[] = [
  {
    id: "fallback-1",
    question: "What documents do I need to apply for finance?",
    answer:
      "You will typically need a valid NZ driver licence or passport, proof of income (recent payslips or bank statements), proof of address (utility bill or bank statement), and details of your current employment. We will guide you through exactly what is needed during the application process.",
    display_order: 0,
    is_active: true,
    created_at: "",
    updated_at: "",
  },
  {
    id: "fallback-2",
    question: "Can I get finance with bad credit?",
    answer:
      "Yes, we work with a range of lenders who specialise in different credit profiles. While interest rates may vary depending on your credit history, we are committed to finding a solution that works for you. Everyone deserves a fair go.",
    display_order: 1,
    is_active: true,
    created_at: "",
    updated_at: "",
  },
  {
    id: "fallback-3",
    question: "How long does the approval process take?",
    answer:
      "In many cases, we can get a pre-approval within the same business day. Full approval typically takes 1-2 business days once all documentation has been submitted. We work hard to make the process as quick and smooth as possible.",
    display_order: 2,
    is_active: true,
    created_at: "",
    updated_at: "",
  },
  {
    id: "fallback-4",
    question: "Can I pay off my loan early?",
    answer:
      "Yes, most of our finance options allow early repayment. Some lenders may charge a small early repayment fee, but many do not. We will make sure you understand all the terms before you sign anything.",
    display_order: 3,
    is_active: true,
    created_at: "",
    updated_at: "",
  },
  {
    id: "fallback-5",
    question: "What is the minimum deposit required?",
    answer:
      "The minimum deposit varies depending on the lender and your credit profile. In some cases, no deposit is required. However, a larger deposit will reduce your loan amount and monthly repayments. We recommend putting down at least 10-20% if possible.",
    display_order: 4,
    is_active: true,
    created_at: "",
    updated_at: "",
  },
];

export const getActiveFinanceFaqs = cache(
  async (): Promise<FinanceFaqRow[]> => {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("finance_faqs")
        .select("*")
        .eq("is_active", true)
        .order("display_order", { ascending: true });
      if (error) throw error;
      const rows = (data ?? []) as FinanceFaqRow[];
      return rows.length > 0 ? rows : FALLBACK_FAQS;
    } catch (e) {
      console.error("[finance-faqs] failed to load, using fallback", e);
      return FALLBACK_FAQS;
    }
  },
);

export const getAllFinanceFaqs = cache(
  async (): Promise<FinanceFaqRow[]> => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("finance_faqs")
      .select("*")
      .order("display_order", { ascending: true });
    if (error) {
      console.error("[finance-faqs] admin fetch failed", error);
      return [];
    }
    return (data ?? []) as FinanceFaqRow[];
  },
);
