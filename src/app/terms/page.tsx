import type { Metadata } from "next";
import PageHeader from "@/components/layout/PageHeader";
import Container from "@/components/ui/Container";

export const metadata: Metadata = {
  title: "Terms of Service",
  description:
    "The terms and conditions that govern your use of the Ideal Cars Ltd website and services.",
};

const lastUpdated = "30 April 2026";

export default function TermsPage() {
  return (
    <>
      <PageHeader
        title="Terms of Service"
        subtitle={`Last updated: ${lastUpdated}`}
      />

      <section className="py-12 sm:py-16">
        <Container>
          <article className="mx-auto max-w-3xl space-y-8 text-silver-dark">
            <p>
              These terms govern your use of the Ideal Cars Ltd website at
              idealcarsltd.co.nz. By using the site you agree to these terms. If
              you do not agree, please do not use the site.
            </p>

            <section>
              <h2 className="mb-3 text-xl font-bold text-navy">
                1. About Ideal Cars Ltd
              </h2>
              <p>
                Ideal Cars Ltd is a New Zealand registered company operating a
                used vehicle dealership. We are a registered Motor Vehicle Trader
                under the Motor Vehicle Sales Act 2003.
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-xl font-bold text-navy">
                2. Vehicle listings
              </h2>
              <p>
                We make every effort to ensure that vehicle details, pricing,
                and photographs displayed on the site are accurate and up to
                date. However, the site is for general information only and does
                not constitute a binding offer of sale. Final terms are agreed
                in writing at the point of sale.
              </p>
              <p className="mt-2">
                Each available vehicle includes a Consumer Information Notice
                (CIN) where required under the Fair Trading Act 1986, providing
                key information about the vehicle&apos;s history.
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-xl font-bold text-navy">
                3. Online forms and enquiries
              </h2>
              <p>
                Submitting a contact, sell, or finance enquiry through this site
                does not create a contractual obligation on either party. We
                will respond to genuine enquiries within a reasonable time. We
                reserve the right to decline service to anyone, at our
                discretion.
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-xl font-bold text-navy">
                4. Finance applications
              </h2>
              <p>
                Finance is provided by third-party lenders, subject to their
                eligibility criteria, terms, and credit checks. Approval is not
                guaranteed. By submitting a finance application, you authorise
                us to forward your information to lending partners for credit
                assessment.
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-xl font-bold text-navy">
                5. Consumer rights
              </h2>
              <p>
                Where we sell to a consumer, your rights under the Consumer
                Guarantees Act 1993 and the Fair Trading Act 1986 are not
                affected by anything on this site or in our terms of sale.
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-xl font-bold text-navy">
                6. Intellectual property
              </h2>
              <p>
                All content on this site (text, images, logos, layouts) is
                owned by Ideal Cars Ltd or used under licence. You may view and
                share content for personal, non-commercial use. Reproduction or
                redistribution without prior written consent is not permitted.
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-xl font-bold text-navy">
                7. Acceptable use
              </h2>
              <p>You agree not to:</p>
              <ul className="mt-2 list-disc space-y-1 pl-6">
                <li>Use the site for any unlawful purpose</li>
                <li>Submit false information through any form</li>
                <li>Attempt to gain unauthorised access to administrative areas</li>
                <li>Scrape, copy, or republish content without permission</li>
                <li>
                  Interfere with the operation of the site (e.g. denial of
                  service, malicious code)
                </li>
              </ul>
            </section>

            <section>
              <h2 className="mb-3 text-xl font-bold text-navy">
                8. Limitation of liability
              </h2>
              <p>
                To the extent permitted by law, Ideal Cars Ltd is not liable for
                any indirect, incidental, or consequential loss arising from use
                of the site, including loss arising from inaccurate vehicle
                information, third-party links, or downtime. This clause does
                not limit your statutory consumer rights.
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-xl font-bold text-navy">
                9. Governing law
              </h2>
              <p>
                These terms are governed by the laws of New Zealand. Any dispute
                will be heard in the New Zealand courts.
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-xl font-bold text-navy">10. Contact</h2>
              <ul className="mt-2 space-y-1">
                <li>Email: <a href="mailto:idealcarsnzltd@gmail.com" className="text-accent hover:underline">idealcarsnzltd@gmail.com</a></li>
                <li>Phone: <a href="tel:02041907335" className="text-accent hover:underline">020 4190 7335</a></li>
                <li>Post: Ideal Cars Ltd, 64 Broad Street, Woolston, Christchurch 8062</li>
              </ul>
            </section>
          </article>
        </Container>
      </section>
    </>
  );
}
