import { createClient } from "@/lib/supabase/server";
import StatusBadge from "@/components/admin/StatusBadge";
import StatusActions from "@/components/admin/StatusActions";
import type { EnquiryStatus } from "@/types/database";

export const dynamic = "force-dynamic";

interface FinanceRow {
  id: string;
  vehicle_id: string | null;
  name: string;
  email: string;
  phone: string;
  employment_status: string | null;
  annual_income: number | null;
  deposit_amount: number | null;
  loan_term_years: number | null;
  message: string | null;
  status: EnquiryStatus;
  created_at: string;
  vehicles: {
    year: number;
    make: string;
    model: string;
    stock_number: string;
  } | null;
}

function fmtMoney(n: number | null): string {
  if (n === null) return "—";
  return `$${Number(n).toLocaleString("en-NZ")}`;
}

export default async function AdminFinancePage() {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("finance_applications")
    .select(
      "id, vehicle_id, name, email, phone, employment_status, annual_income, deposit_amount, loan_term_years, message, status, created_at, vehicles(year, make, model, stock_number)",
    )
    .order("created_at", { ascending: false });

  const apps = (data ?? []) as unknown as FinanceRow[];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-navy">Finance Applications</h1>
        <p className="mt-1 text-sm text-silver-dark">
          {apps.length} total · {apps.filter((a) => a.status === "new").length} new
        </p>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          Failed to load: {error.message}
        </div>
      )}

      {apps.length === 0 ? (
        <div className="rounded-xl border border-silver bg-white p-12 text-center text-silver-dark">
          No applications yet.
        </div>
      ) : (
        <ul className="space-y-3">
          {apps.map((a) => (
            <li key={a.id} className="rounded-xl border border-silver bg-white p-5 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold text-navy">{a.name}</span>
                    <StatusBadge status={a.status} />
                  </div>
                  <p className="mt-1 text-sm text-silver-dark">
                    <a href={`mailto:${a.email}`} className="text-accent hover:underline">{a.email}</a>
                    {" · "}
                    <a href={`tel:${a.phone}`} className="text-accent hover:underline">{a.phone}</a>
                  </p>
                  {a.vehicles && (
                    <p className="mt-1 text-sm text-silver-dark">
                      For: {a.vehicles.year} {a.vehicles.make} {a.vehicles.model} (#{a.vehicles.stock_number})
                    </p>
                  )}
                </div>
                <span className="whitespace-nowrap text-xs text-silver-dark">
                  {new Date(a.created_at).toLocaleString("en-NZ")}
                </span>
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
                    {a.loan_term_years ? `${a.loan_term_years} yr` : "—"}
                  </p>
                </div>
              </div>

              {a.message && (
                <p className="mt-3 whitespace-pre-wrap rounded-lg bg-gray-50 p-3 text-sm text-navy">
                  {a.message}
                </p>
              )}

              <div className="mt-3">
                <StatusActions
                  table="finance_applications"
                  id={a.id}
                  status={a.status}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
