"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import PasswordInput from "@/components/ui/PasswordInput";
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
    if (typeof window === "undefined") return;

    function isExpiredError(message: string) {
      const m = message.toLowerCase();
      return m.includes("expired") || m.includes("invalid") || m.includes("otp");
    }

    const hashParams = window.location.hash
      ? new URLSearchParams(window.location.hash.slice(1))
      : null;

    // Supabase may put an explicit error in the hash
    if (hashParams?.get("error_code") === "otp_expired") {
      setStatus("linkExpired");
      return;
    }

    // Implicit flow — hash carries access_token + refresh_token
    const accessToken = hashParams?.get("access_token");
    const refreshToken = hashParams?.get("refresh_token");
    if (accessToken && refreshToken) {
      supabase.auth
        .setSession({ access_token: accessToken, refresh_token: refreshToken })
        .then(({ data, error }) => {
          if (error) {
            setStatus(isExpiredError(error.message) ? "linkExpired" : "noSession");
            return;
          }
          if (data.session) {
            // Clear the tokens from the URL bar
            window.history.replaceState(null, "", window.location.pathname);
            setStatus("ready");
          } else {
            setStatus("noSession");
          }
        })
        .catch(() => setStatus("noSession"));
      return;
    }

    const url = new URL(window.location.href);

    // PKCE flow — Supabase redirects with ?code=...
    const code = url.searchParams.get("code");
    if (code) {
      supabase.auth
        .exchangeCodeForSession(code)
        .then(({ data, error }) => {
          if (error) {
            setStatus(isExpiredError(error.message) ? "linkExpired" : "noSession");
            return;
          }
          setStatus(data.session ? "ready" : "noSession");
        })
        .catch(() => setStatus("noSession"));
      return;
    }

    // Token-hash flow — ?token_hash=...&type=invite|recovery|magiclink
    const tokenHash = url.searchParams.get("token_hash");
    const otpType = url.searchParams.get("type");
    if (tokenHash && otpType) {
      supabase.auth
        .verifyOtp({
          token_hash: tokenHash,
          type: otpType as "invite" | "recovery" | "magiclink" | "email",
        })
        .then(({ data, error }) => {
          if (error) {
            setStatus(isExpiredError(error.message) ? "linkExpired" : "noSession");
            return;
          }
          setStatus(data.session ? "ready" : "noSession");
        })
        .catch(() => setStatus("noSession"));
      return;
    }

    // No token in URL — maybe the user is already signed in (e.g., navigated here)
    supabase.auth.getSession().then(({ data }) => {
      setStatus(data.session ? "ready" : "noSession");
    });
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
        label="Confirm password"
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
        {submitting ? "Saving..." : "Save Password"}
      </Button>
    </form>
  );
}
