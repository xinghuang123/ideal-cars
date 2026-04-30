"use client";

import { useState } from "react";
import Input from "@/components/ui/Input";
import PasswordInput from "@/components/ui/PasswordInput";
import Button from "@/components/ui/Button";
import { createClient } from "@/lib/supabase/client";
import { sendWelcomeEmail } from "@/app/account/actions";

export default function SignupForm() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

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
    const { error: signUpError } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: {
          full_name: fullName.trim(),
          phone: phone.trim(),
        },
        emailRedirectTo: `${window.location.origin}/auth/callback?redirect=/account`,
      },
    });

    setSubmitting(false);

    if (signUpError) {
      setError(signUpError.message);
      return;
    }

    // Fire-and-forget welcome email; don't block UX on this.
    void sendWelcomeEmail(email.trim(), fullName.trim() || null);

    setSuccess(true);
  }

  if (success) {
    return (
      <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-800">
        <p className="font-semibold">Check your email.</p>
        <p className="mt-1">
          We sent a confirmation link to <strong>{email}</strong>. Click it to
          activate your account.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Full name"
        name="full_name"
        type="text"
        autoComplete="name"
        value={fullName}
        onChange={(e) => setFullName(e.target.value)}
        required
      />
      <Input
        label="Email"
        name="email"
        type="email"
        autoComplete="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <Input
        label="Phone (optional)"
        name="phone"
        type="tel"
        autoComplete="tel"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
      />
      <PasswordInput
        label="Password"
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
        {submitting ? "Creating account..." : "Create account"}
      </Button>
      <p className="text-center text-xs text-silver-dark">
        By creating an account you agree to our{" "}
        <a href="/terms" className="underline hover:text-accent">
          Terms
        </a>{" "}
        and{" "}
        <a href="/privacy" className="underline hover:text-accent">
          Privacy Policy
        </a>
        .
      </p>
    </form>
  );
}
