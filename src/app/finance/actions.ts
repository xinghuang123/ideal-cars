"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { notifyAdmins, escapeHtml } from "@/lib/email";

interface FinanceInput {
  name: string;
  email: string;
  phone: string;
  employment_status: string | null;
  annual_income: number | null;
  deposit_amount: number | null;
  loan_term_years: number | null;
  vehicle_id: string | null;
  message: string | null;
}

export async function submitFinanceApplication(
  input: FinanceInput,
): Promise<{ ok?: true; error?: string }> {
  const supabase = createClient();

  if (!input.name.trim() || !input.email.trim() || !input.phone.trim()) {
    return { error: "Name, email, and phone are required." };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  const role = (user?.app_metadata as Record<string, unknown> | undefined)?.role;
  const customerId = user && role !== "admin" ? user.id : null;

  const { error } = await supabase.from("finance_applications").insert({
    name: input.name.trim(),
    email: input.email.trim(),
    phone: input.phone.trim(),
    employment_status: input.employment_status,
    annual_income: input.annual_income,
    deposit_amount: input.deposit_amount,
    loan_term_years: input.loan_term_years,
    vehicle_id: input.vehicle_id,
    message: input.message,
    customer_id: customerId,
  });

  if (error) return { error: error.message };

  await notifyAdmins({
    subject: `New finance application — ${input.name.trim()}`,
    html: renderFinanceEmail(input),
    replyTo: input.email.trim(),
  });

  revalidatePath("/account/finance");
  return { ok: true };
}

function renderFinanceEmail(e: FinanceInput): string {
  const safe = {
    name: escapeHtml(e.name),
    email: escapeHtml(e.email),
    phone: escapeHtml(e.phone),
    employment: e.employment_status ? escapeHtml(e.employment_status) : "—",
    message: e.message ? escapeHtml(e.message).replace(/\n/g, "<br/>") : "",
  };
  const fmt = (n: number | null) =>
    n === null ? "—" : `$${n.toLocaleString("en-NZ")}`;
  return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #1E2A3A; border-bottom: 2px solid #5BC0EB; padding-bottom: 8px;">
        New Finance Application
      </h2>
      <table style="width: 100%; border-collapse: collapse; margin-top: 16px;">
        <tr><td style="padding: 8px 0; color: #5b6570; width: 140px;">From</td><td style="padding: 8px 0;"><strong>${safe.name}</strong></td></tr>
        <tr><td style="padding: 8px 0; color: #5b6570;">Email</td><td style="padding: 8px 0;"><a href="mailto:${safe.email}">${safe.email}</a></td></tr>
        <tr><td style="padding: 8px 0; color: #5b6570;">Phone</td><td style="padding: 8px 0;"><a href="tel:${safe.phone}">${safe.phone}</a></td></tr>
        <tr><td style="padding: 8px 0; color: #5b6570;">Employment</td><td style="padding: 8px 0;">${safe.employment}</td></tr>
        <tr><td style="padding: 8px 0; color: #5b6570;">Annual income</td><td style="padding: 8px 0;">${fmt(e.annual_income)}</td></tr>
        <tr><td style="padding: 8px 0; color: #5b6570;">Deposit</td><td style="padding: 8px 0;">${fmt(e.deposit_amount)}</td></tr>
        <tr><td style="padding: 8px 0; color: #5b6570;">Loan term</td><td style="padding: 8px 0;">${e.loan_term_years ?? "—"} year${e.loan_term_years === 1 ? "" : "s"}</td></tr>
      </table>
      ${
        safe.message
          ? `<div style="margin-top: 16px; padding: 16px; background: #f8f9fa; border-left: 3px solid #5BC0EB; border-radius: 4px;">${safe.message}</div>`
          : ""
      }
    </div>
  `;
}
