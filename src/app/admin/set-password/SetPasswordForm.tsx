"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { createClient } from "@/lib/supabase/client";

type Status = "loading" | "ready" | "linkExpired" | "noSession";

export default function SetPasswordForm() {
  const router = useRouter();
  const supabase = createClient();
  const [status, setStatus] = useState<Status>("loading");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    // Supabase recovery / invite links arrive with a hash like
    // #access_token=...&refresh_token=...&type=recovery
    // The supabase-js client picks these up automatically and emits
    // a PASSWORD_RECOVERY event. We confirm a session exists before
    // showing the form.

    if (typeof window !== "undefined" && window.location.hash) {
      const params = new URLSearchParams(window.location.hash.slice(1));
      if (params.get("error_code") === "otp_expired") {
        setStatus("linkExpired");
        return;
      }
    }

    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN") {
        if (session) setStatus("ready");
      }
    });

    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        setStatus("ready");
      } else {
        // Give the listener a moment to pick up the hash
        setTimeout(() => {
          supabase.auth.getSession().then(({ data: d2 }) => {
            setStatus(d2.session ? "ready" : "noSession");
          });
        }, 800);
      }
    });

    return () => {
      sub.subscription.unsubscribe();
    };
  }, [supabase]);

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
    const { error: updateError } = await supabase.auth.updateUser({ password });
    if (updateError) {
      setSubmitting(false);
      setError(updateError.message);
      return;
    }
    setSuccess(true);
    setTimeout(() => {
      router.push("/admin");
      router.refresh();
    }, 1200);
  }

  if (status === "loading") {
    return (
      <p className="text-sm text-silver-dark">Verifying your link...</p>
    );
  }

  if (status === "linkExpired") {
    return (
      <div className="space-y-3">
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          This link has expired or already been used. Ask an admin to send a
          new invite or password recovery email.
        </div>
        <Button
          type="button"
          variant="secondary"
          className="w-full"
          onClick={() => router.push("/admin/login")}
        >
          Back to sign in
        </Button>
      </div>
    );
  }

  if (status === "noSession") {
    return (
      <div className="space-y-3">
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          No valid invite or recovery link detected. Open the link from your
          email directly.
        </div>
        <Button
          type="button"
          variant="secondary"
          className="w-full"
          onClick={() => router.push("/admin/login")}
        >
          Back to sign in
        </Button>
      </div>
    );
  }

  if (success) {
    return (
      <div className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700">
        Password saved. Redirecting to admin...
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="New password"
        name="password"
        type="password"
        autoComplete="new-password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        minLength={8}
      />
      <Input
        label="Confirm password"
        name="confirm"
        type="password"
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
        {submitting ? "Saving..." : "Save Password"}
      </Button>
    </form>
  );
}
