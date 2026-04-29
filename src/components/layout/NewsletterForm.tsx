"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Status = "idle" | "submitting" | "success" | "error" | "duplicate";

export default function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed) return;

    setStatus("submitting");

    const supabase = createClient();
    const { error } = await supabase
      .from("newsletter_subscribers")
      .insert({ email: trimmed });

    if (error) {
      // Postgres unique-violation code
      if (error.code === "23505") {
        setStatus("duplicate");
        return;
      }
      setStatus("error");
      return;
    }

    setStatus("success");
    setEmail("");
  }

  if (status === "success") {
    return (
      <p className="mt-4 rounded-md bg-accent/10 px-3 py-2 text-sm text-accent">
        Thanks for subscribing!
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
          if (status !== "idle" && status !== "submitting") setStatus("idle");
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
      {status === "duplicate" && (
        <p className="text-xs text-silver-dark">
          You are already subscribed.
        </p>
      )}
      {status === "error" && (
        <p className="text-xs text-red-300">
          Something went wrong. Please try again.
        </p>
      )}
    </form>
  );
}
