import type { Metadata } from "next";
import PageHeader from "@/components/layout/PageHeader";
import Container from "@/components/ui/Container";
import ThankYouCard from "./ThankYouCard";

export const metadata: Metadata = {
  title: "Message Sent | Ideal Cars",
  description: "Thank you for contacting Ideal Cars. We will be in touch soon.",
  // Keep the confirmation page out of search results.
  robots: { index: false, follow: false },
};

export default function ContactThankYouPage() {
  return (
    <>
      <PageHeader
        title="Message Sent"
        subtitle="Thanks for getting in touch — we have received your message."
      />

      <section className="py-12 sm:py-16">
        <Container>
          <ThankYouCard />
        </Container>
      </section>
    </>
  );
}
