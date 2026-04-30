"use client";

import { useState } from "react";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { submitFinanceApplication } from "@/app/finance/actions";

const EMPLOYMENT = [
  "Full-time",
  "Part-time",
  "Self-employed",
  "Contractor",
  "Student",
  "Retired",
  "Other",
];

interface Props {
  vehicleId?: string;
  defaultName?: string;
  defaultEmail?: string;
  defaultPhone?: string;
}

export default function FinanceApplicationForm({
  vehicleId,
  defaultName,
  defaultEmail,
  defaultPhone,
}: Props) {
  const [values, setValues] = useState({
    name: defaultName ?? "",
    email: defaultEmail ?? "",
    phone: defaultPhone ?? "",
    employment_status: "",
    annual_income: "",
    deposit_amount: "",
    loan_term_years: "3",
    message: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  function set<K extends keyof typeof values>(key: K, val: string) {
    setValues((v) => ({ ...v, [key]: val }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const res = await submitFinanceApplication({
      name: values.name,
      email: values.email,
      phone: values.phone,
      employment_status: values.employment_status || null,
      annual_income: values.annual_income ? Number(values.annual_income) : null,
      deposit_amount: values.deposit_amount ? Number(values.deposit_amount) : null,
      loan_term_years: values.loan_term_years ? Number(values.loan_term_years) : null,
      vehicle_id: vehicleId ?? null,
      message: values.message || null,
    });

    setSubmitting(false);
    if (res.error) {
      setError(res.error);
      return;
    }
    setDone(true);
  }

  if (done) {
    return (
      <div className="rounded-xl border border-green-200 bg-green-50 p-6 text-sm text-green-800">
        <p className="font-semibold">Application received.</p>
        <p className="mt-1">
          Thanks for applying. One of our finance team will be in touch within
          one business day. You can track this application in your account if
          you&apos;re signed in.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-5 rounded-xl border border-silver bg-white p-6 shadow-sm"
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Input label="Full name" value={values.name} onChange={(e) => set("name", e.target.value)} required />
        <Input label="Email" type="email" value={values.email} onChange={(e) => set("email", e.target.value)} required />
        <Input label="Phone" type="tel" value={values.phone} onChange={(e) => set("phone", e.target.value)} required />
        <div>
          <label className="mb-1.5 block text-sm font-medium text-navy">Employment status</label>
          <select
            value={values.employment_status}
            onChange={(e) => set("employment_status", e.target.value)}
            className="w-full rounded-lg border border-silver bg-white px-3 py-2.5 text-navy focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30"
          >
            <option value="">— Select —</option>
            {EMPLOYMENT.map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        </div>
        <Input label="Annual income (NZD)" type="number" min={0} value={values.annual_income} onChange={(e) => set("annual_income", e.target.value)} />
        <Input label="Deposit amount (NZD)" type="number" min={0} value={values.deposit_amount} onChange={(e) => set("deposit_amount", e.target.value)} />
        <Input label="Loan term (years)" type="number" min={1} max={7} value={values.loan_term_years} onChange={(e) => set("loan_term_years", e.target.value)} />
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-navy">Anything else?</label>
        <textarea
          rows={3}
          value={values.message}
          onChange={(e) => set("message", e.target.value)}
          className="w-full rounded-lg border border-silver bg-white px-4 py-2.5 text-navy placeholder:text-silver-dark focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30"
        />
      </div>

      {error && (
        <div role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="flex justify-end">
        <Button type="submit" disabled={submitting}>
          {submitting ? "Submitting..." : "Submit application"}
        </Button>
      </div>
    </form>
  );
}
