import type { Metadata } from "next";
import Link from "next/link";
import PageHeader from "@/components/layout/PageHeader";
import Container from "@/components/ui/Container";
import Button from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "Message Sent | Ideal Cars",
  description: "Thank you for contacting Ideal Cars. We will be in touch soon.",
  // Keep the confirmation page out of search results.
  robots: { index: false, follow: false },
};

export default async function ContactThankYouPage({
  searchParams,
}: {
  searchParams: Promise<{ name?: string }>;
}) {
  const { name } = await searchParams;
  const firstName = name?.trim().split(/\s+/)[0];

  return (
    <>
      <PageHeader
        title="Message Sent"
        subtitle="Thanks for getting in touch — we have received your message."
      />

      <section className="py-12 sm:py-16">
        <Container>
          <div className="mx-auto max-w-xl rounded-xl border border-green-200 bg-green-50 p-8 text-center shadow-sm">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
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
            </div>
            <h2 className="text-2xl font-bold text-green-800">Message Sent!</h2>
            <p className="mt-2 text-green-700">
              Thank you{firstName ? `, ${firstName}` : ""}. We have received your
              message and will get back to you within one business day.
            </p>
            <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
              <Button asChild>
                <Link href="/buy">Browse our cars</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/">Back to home</Link>
              </Button>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
