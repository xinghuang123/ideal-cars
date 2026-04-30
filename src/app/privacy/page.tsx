import type { Metadata } from "next";
import PageHeader from "@/components/layout/PageHeader";
import Container from "@/components/ui/Container";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How Ideal Cars Ltd collects, uses, and protects your personal information in accordance with the Privacy Act 2020.",
};

const lastUpdated = "30 April 2026";

export default function PrivacyPage() {
  return (
    <>
      <PageHeader
        title="Privacy Policy"
        subtitle={`Last updated: ${lastUpdated}`}
      />

      <section className="py-12 sm:py-16">
        <Container>
          <article className="mx-auto max-w-3xl space-y-8 text-silver-dark">
            <p>
              Ideal Cars Ltd (&quot;we&quot;, &quot;us&quot;, &quot;our&quot;)
              is committed to protecting your privacy. This policy explains how
              we collect, use, store, and disclose your personal information in
              accordance with the New Zealand Privacy Act 2020.
            </p>

            <section>
              <h2 className="mb-3 text-xl font-bold text-navy">
                1. Information we collect
              </h2>
              <p>We may collect the following personal information:</p>
              <ul className="mt-2 list-disc space-y-1 pl-6">
                <li>
                  Name, email address, and phone number — when you submit a
                  contact form, vehicle enquiry, sell-car request, finance
                  application, or subscribe to our newsletter.
                </li>
                <li>
                  Vehicle details — when you request a valuation for a vehicle
                  you wish to sell.
                </li>
                <li>
                  Financial information — only when you apply for finance,
                  limited to what is required for credit assessment.
                </li>
                <li>
                  Technical data — IP address, browser type, and pages visited
                  via standard analytics tools.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="mb-3 text-xl font-bold text-navy">
                2. How we use your information
              </h2>
              <p>We use your personal information to:</p>
              <ul className="mt-2 list-disc space-y-1 pl-6">
                <li>Respond to enquiries and provide vehicle quotations</li>
                <li>Process finance applications with our lending partners</li>
                <li>Send transactional emails (e.g., enquiry confirmations)</li>
                <li>
                  Send marketing communications (only if you have opted in via
                  the newsletter)
                </li>
                <li>
                  Improve our website and services through analytics and feedback
                </li>
                <li>Comply with legal obligations</li>
              </ul>
            </section>

            <section>
              <h2 className="mb-3 text-xl font-bold text-navy">
                3. Sharing your information
              </h2>
              <p>
                We do not sell your personal information. We may share it with:
              </p>
              <ul className="mt-2 list-disc space-y-1 pl-6">
                <li>
                  Lending partners — only when you apply for finance, and only
                  the information needed for assessment
                </li>
                <li>
                  Service providers — including our website hosting (Vercel),
                  database (Supabase), and email service (Resend), under
                  contractual privacy obligations
                </li>
                <li>
                  Government agencies — when required by law (e.g., NZ Transport
                  Agency for vehicle ownership transfers)
                </li>
              </ul>
            </section>

            <section>
              <h2 className="mb-3 text-xl font-bold text-navy">
                4. Storage and security
              </h2>
              <p>
                Your information is stored securely with our service providers
                using encryption in transit and at rest. We retain personal
                information only for as long as needed to fulfil the purpose it
                was collected for, or as required by law (typically 7 years for
                financial transactions).
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-xl font-bold text-navy">5. Cookies</h2>
              <p>
                Our website uses cookies for essential site functionality (e.g.,
                keeping you signed in to staff areas) and basic analytics. You
                can disable cookies in your browser, though some features of the
                site may not work correctly.
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-xl font-bold text-navy">6. Your rights</h2>
              <p>Under the Privacy Act 2020, you have the right to:</p>
              <ul className="mt-2 list-disc space-y-1 pl-6">
                <li>Request access to the personal information we hold about you</li>
                <li>Request correction of inaccurate information</li>
                <li>Withdraw consent for marketing communications at any time</li>
                <li>
                  Lodge a complaint with the Office of the Privacy Commissioner
                  (privacy.org.nz)
                </li>
              </ul>
            </section>

            <section>
              <h2 className="mb-3 text-xl font-bold text-navy">7. Contact us</h2>
              <p>For privacy-related queries, contact us at:</p>
              <ul className="mt-2 space-y-1">
                <li>Email: <a href="mailto:idealcarsnzltd@gmail.com" className="text-accent hover:underline">idealcarsnzltd@gmail.com</a></li>
                <li>Phone: <a href="tel:02041907335" className="text-accent hover:underline">020 4190 7335</a></li>
                <li>Post: Ideal Cars Ltd, 64 Broad Street, Woolston, Christchurch 8062</li>
              </ul>
            </section>

            <section>
              <h2 className="mb-3 text-xl font-bold text-navy">
                8. Changes to this policy
              </h2>
              <p>
                We may update this policy from time to time. The date at the top
                indicates when it was last revised. Material changes will be
                announced on our homepage.
              </p>
            </section>
          </article>
        </Container>
      </section>
    </>
  );
}
