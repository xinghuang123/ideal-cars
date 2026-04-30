import Link from "next/link";
import { getCurrentCustomer } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

interface FinanceRow {
  id: string;
  vehicle_id: string | null;
  employment_status: string | null;
  annual_income: number | null;
  deposit_amount: number | null;
  loan_term_years: number | null;
  message: string | null;
  status: "new" | "contacted" | "in_progress" | "completed" | "archived";
  created_at: string;
  vehicles: { year: number; make: string; model: string } | null;
}

const statusLabel: Record<FinanceRow["status"], { label: string; cls: string }> =
  {
    new: { label: "Submitted", cls: "bg-blue-100 text-blue-800" },
    contacted: { label: "Contacted", cls: "bg-yellow-100 text-yellow-800" },
    in_progress: { label: "In progress", cls: "bg-purple-100 text-purple-800" },
    completed: { label: "Approved", cls: "bg-green-100 text-green-800" },
    archived: { label: "Closed", cls: "bg-gray-100 text-gray-700" },
  };

function fmtMoney(n: number | null): string {
  if (n === null) return "—";
  return `$${Number(n).toLocaleString("en-NZ")}`;
}

export default async function FinanceRecordPage() {
  const customer = await getCurrentCustomer();
  if (!customer) return null;

  const supabase = createClient();
  const { data, error } = await supabase
    .from("finance_applications")
    .select(
      "id, vehicle_id, employment_status, annual_income, deposit_amount, loan_term_years, message, status, created_at, vehicles(year, make, model)",
    )
    .eq("customer_id", customer.userId)
    .order("created_at", { ascending: false });

  const applications = (data ?? []) as unknown as FinanceRow[];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-navy">Finance Record</h1>
          <p className="mt-1 text-sm text-silver-dark">
            Your finance applications and their current status.
          </p>
        </div>
        <Link
          href="/finance"
          className="inline-flex items-center rounded-md bg-accent px-4 py-2 text-sm font-medium text-navy hover:bg-accent-dark"
        >
          New application
        </Link>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          Failed to load: {error.message}
        </div>
      )}

      {applications.length === 0 ? (
        <div className="rounded-xl border border-silver bg-white p-12 text-center">
          <p className="text-silver-dark">No finance applications yet.</p>
          <Link
            href="/finance"
            className="mt-4 inline-flex items-center rounded-md bg-accent px-4 py-2 text-sm font-medium text-navy hover:bg-accent-dark"
          >
            Apply now
          </Link>
        </div>
      ) : (
        <ul className="space-y-3">
          {applications.map((a) => {
            const badge = statusLabel[a.status] ?? statusLabel.new;
            return (
              <li
                key={a.id}
                className="rounded-xl border border-silver bg-white p-5 shadow-sm"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-semibold ${badge.cls}`}
                      >
                        {badge.label}
                      </span>
                      <span className="text-xs text-silver-dark">
                        {new Date(a.created_at).toLocaleDateString("en-NZ")}
                      </span>
                    </div>
                    {a.vehicles && (
                      <p className="mt-1 font-semibold text-navy">
                        For: {a.vehicles.year} {a.vehicles.make} {a.vehicles.model}
                      </p>
                    )}
                  </div>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
                  <div>
                    <p className="text-xs text-silver-dark">Employment</p>
                    <p className="text-navy">{a.employment_status ?? "—"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-silver-dark">Annual income</p>
                    <p className="text-navy">{fmtMoney(a.annual_income)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-silver-dark">Deposit</p>
                    <p className="text-navy">{fmtMoney(a.deposit_amount)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-silver-dark">Loan term</p>
                    <p className="text-navy">
                      {a.loan_term_years
                        ? `${a.loan_term_years} year${a.loan_term_years === 1 ? "" : "s"}`
                        : "—"}
                    </p>
                  </div>
                </div>

                {a.message && (
                  <p className="mt-3 whitespace-pre-wrap rounded-lg bg-gray-50 p-3 text-sm text-navy">
                    {a.message}
                  </p>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
