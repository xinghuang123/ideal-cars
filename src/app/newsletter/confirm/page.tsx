import Link from "next/link";
import type { Metadata } from "next";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Confirm your subscription | Ideal Cars",
  robots: { index: false, follow: false },
};

type State = "success" | "already" | "invalid";

export default async function ConfirmNewsletterPage({
  searchParams,
}: {
  searchParams: { token?: string };
}) {
  const token = searchParams.token?.trim();
  let state: State = "invalid";

  // Basic UUID shape guard before hitting the DB.
  const isUuid =
    !!token &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      token,
    );

  if (isUuid) {
    const admin = createAdminClient();
    const { data } = await admin
      .from("newsletter_subscribers")
      .select("id, confirmed")
      .eq("confirmation_token", token)
      .maybeSingle();

    if (data) {
      if (data.confirmed) {
        state = "already";
      } else {
        const { error } = await admin
          .from("newsletter_subscribers")
          .update({
            confirmed: true,
            confirmed_at: new Date().toISOString(),
            is_active: true,
            unsubscribed_at: null,
          })
          .eq("id", data.id);
        state = error ? "invalid" : "success";
      }
    }
  }

  const content = {
    success: {
      heading: "You're subscribed!",
      body: "Thanks for confirming. You'll now receive the latest stock, deals, and car-buying tips from Ideal Cars.",
      tone: "good" as const,
    },
    already: {
      heading: "Already confirmed",
      body: "This email address is already subscribed to our newsletter. Nothing more to do.",
      tone: "good" as const,
    },
    invalid: {
      heading: "Link not valid",
      body: "This confirmation link is invalid or has expired. Please subscribe again from our website to receive a fresh link.",
      tone: "bad" as const,
    },
  }[state];

  return (
    <div className="flex min-h-[calc(100vh-5rem)] items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-md rounded-xl border border-silver bg-white p-8 text-center shadow-sm">
        <div
          className={`mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full ${
            content.tone === "good" ? "bg-green-100" : "bg-red-100"
          }`}
        >
          {content.tone === "good" ? (
            <svg
              className="h-8 w-8 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          ) : (
            <svg
              className="h-8 w-8 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          )}
        </div>
        <h1 className="text-2xl font-bold text-navy">{content.heading}</h1>
        <p className="mt-2 text-silver-dark">{content.body}</p>
        <Link
          href="/"
          className="mt-6 inline-block rounded-md bg-accent px-5 py-2.5 text-sm font-medium text-navy transition-colors hover:bg-accent-dark"
        >
          Back to home
        </Link>
      </div>
    </div>
  );
}
