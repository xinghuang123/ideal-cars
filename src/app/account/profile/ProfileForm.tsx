"use client";

import { useState } from "react";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { updateProfile } from "@/app/account/actions";

interface ProfileFormProps {
  email: string;
  initial: {
    full_name: string;
    phone: string;
    address_line1: string;
    address_line2: string;
    city: string;
    region: string;
    postcode: string;
  };
}

export default function ProfileForm({ email, initial }: ProfileFormProps) {
  const [values, setValues] = useState(initial);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  function set<K extends keyof typeof values>(key: K, val: string) {
    setValues((v) => ({ ...v, [key]: val }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setMessage(null);

    const res = await updateProfile({
      full_name: values.full_name,
      phone: values.phone || null,
      address_line1: values.address_line1 || null,
      address_line2: values.address_line2 || null,
      city: values.city || null,
      region: values.region || null,
      postcode: values.postcode || null,
    });

    setSubmitting(false);
    if ("error" in res && res.error) {
      setMessage({ type: "error", text: res.error });
    } else {
      setMessage({ type: "success", text: "Profile saved." });
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-5 rounded-xl border border-silver bg-white p-6 shadow-sm"
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Input label="Full name" value={values.full_name} onChange={(e) => set("full_name", e.target.value)} required />
        <Input label="Email" value={email} disabled />
        <Input label="Phone" type="tel" value={values.phone} onChange={(e) => set("phone", e.target.value)} />
      </div>

      <div>
        <h2 className="mb-3 text-sm font-semibold text-navy">Address</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Input label="Street address" value={values.address_line1} onChange={(e) => set("address_line1", e.target.value)} />
          </div>
          <div className="sm:col-span-2">
            <Input label="Address line 2 (optional)" value={values.address_line2} onChange={(e) => set("address_line2", e.target.value)} />
          </div>
          <Input label="City / Suburb" value={values.city} onChange={(e) => set("city", e.target.value)} />
          <Input label="Region" value={values.region} onChange={(e) => set("region", e.target.value)} />
          <Input label="Postcode" value={values.postcode} onChange={(e) => set("postcode", e.target.value)} />
        </div>
      </div>

      {message && (
        <div
          role="alert"
          className={`rounded-lg border p-3 text-sm ${
            message.type === "success"
              ? "border-green-200 bg-green-50 text-green-800"
              : "border-red-200 bg-red-50 text-red-700"
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="flex justify-end">
        <Button type="submit" disabled={submitting}>
          {submitting ? "Saving..." : "Save changes"}
        </Button>
      </div>
    </form>
  );
}
