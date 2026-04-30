"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import PasswordInput from "@/components/ui/PasswordInput";
import Button from "@/components/ui/Button";
import { createClient } from "@/lib/supabase/client";

export default function ResetPasswordForm() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    setSubmitting(true);
    const supabase = createClient();
    const { error: updateError } = await supabase.auth.updateUser({ password });
    setSubmitting(false);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    router.push("/account");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PasswordInput
        label="New password"
        name="password"
        autoComplete="new-password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        minLength={8}
      />
      <PasswordInput
        label="Confirm new password"
        name="confirm"
        autoComplete="new-password"
        value={confirm}
        onChange={(e) => setConfirm(e.target.value)}
        required
        minLength={8}
      />
      {error && (
        <div
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"
        >
          {error}
        </div>
      )}
      <Button type="submit" size="lg" className="w-full" disabled={submitting}>
        {submitting ? "Updating..." : "Update password"}
      </Button>
    </form>
  );
}
