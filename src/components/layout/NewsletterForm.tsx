"use client";

import { useState } from "react";
import { subscribeNewsletter } from "@/app/newsletter/actions";

type Status =
  | "idle"
  | "submitting"
  | "pending"
  | "already"
  | "error";

export default function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed) return;

    setStatus("submitting");
    setErrorMsg(null);

    const result = await subscribeNewsletter(trimmed);

    if ("error" in result) {
      setErrorMsg(result.error);
      setStatus("error");
      return;
    }

    if (result.status === "already") {
      setStatus("already");
      return;
    }

    setStatus("pending");
    setEmail("");
  }

  if (status === "pending") {
    return (
      <p className="mt-4 rounded-md bg-accent/10 px-3 py-2 text-sm text-accent">
        Almost there! We&apos;ve sent a confirmation link to your email — please
        click it to complete your subscription.
      </p>
    );
  }

  if (status === "already") {
    return (
      <p className="mt-4 rounded-md bg-accent/10 px-3 py-2 text-sm text-accent">
        You&apos;re already subscribed — thanks for being with us!
      </p>
    );
  }

  return (
    <form className="mt-4 flex flex-col gap-2" onSubmit={handleSubmit}>
      <input
        type="email"
        value={email}
        onChange={(e) => {
          setEmail(e.target.value);
          if (status !== "idle" && status !== "submitting") {
            setStatus("idle");
            setErrorMsg(null);
          }
        }}
        placeholder="Your email address"
        className="w-full rounded-md border border-navy-light bg-navy-dark px-3 py-2 text-sm text-silver placeholder:text-silver-dark focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
        required
      />
      <button
        type="submit"
        disabled={status === "submitting"}
        className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-navy transition-colors hover:bg-accent-dark disabled:opacity-60"
      >
        {status === "submitting" ? "Subscribing..." : "Subscribe"}
      </button>
      {status === "error" && (
        <p className="text-xs text-red-300">
          {errorMsg ?? "Something went wrong. Please try again."}
        </p>
      )}
    </form>
  );
}
