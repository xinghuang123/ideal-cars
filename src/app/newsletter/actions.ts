"use server";

import { randomUUID } from "crypto";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  sendTransactionalEmail,
  renderNewsletterConfirmEmail,
} from "@/lib/email";

export type SubscribeResult =
  | { status: "pending" } // confirmation email sent, awaiting click
  | { status: "already" } // email already confirmed
  | { error: string };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const GENERIC_ERROR = "Something went wrong. Please try again.";

/**
 * Double opt-in newsletter sign-up. Creates (or refreshes) an unconfirmed
 * subscriber and emails them a tokenised confirmation link. The address is
 * not counted as a real subscriber until they click it.
 *
 * Runs through the service-role client so it can read back / update the
 * pending row (anon RLS only allows INSERT).
 */
export async function subscribeNewsletter(
  rawEmail: string,
): Promise<SubscribeResult> {
  const email = rawEmail.trim().toLowerCase();
  if (!email || !EMAIL_RE.test(email)) {
    return { error: "Please enter a valid email address." };
  }

  const admin = createAdminClient();

  const { data: existing, error: lookupError } = await admin
    .from("newsletter_subscribers")
    .select("id, confirmed")
    .eq("email", email)
    .maybeSingle();

  if (lookupError) {
    console.error("[newsletter] lookup failed:", lookupError);
    return { error: GENERIC_ERROR };
  }

  if (existing?.confirmed) {
    return { status: "already" };
  }

  const token = randomUUID();

  if (existing) {
    // Pending sign-up re-subscribing — issue a fresh token and reactivate.
    const { error } = await admin
      .from("newsletter_subscribers")
      .update({
        confirmation_token: token,
        is_active: true,
        unsubscribed_at: null,
      })
      .eq("id", existing.id);
    if (error) {
      console.error("[newsletter] update failed:", error);
      return { error: GENERIC_ERROR };
    }
  } else {
    const { error } = await admin.from("newsletter_subscribers").insert({
      email,
      confirmed: false,
      confirmation_token: token,
    });
    if (error) {
      console.error("[newsletter] insert failed:", error);
      return { error: GENERIC_ERROR };
    }
  }

  const siteUrl = (
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://idealcarsltd.co.nz"
  ).replace(/\/$/, "");
  const confirmUrl = `${siteUrl}/newsletter/confirm?token=${token}`;

  const sent = await sendTransactionalEmail({
    to: email,
    subject: "Confirm your newsletter subscription — Ideal Cars",
    html: renderNewsletterConfirmEmail(confirmUrl),
  });

  if ("error" in sent) {
    return {
      error:
        "We couldn't send the confirmation email just now. Please try again shortly.",
    };
  }

  return { status: "pending" };
}
