import type { Metadata } from "next";
import PageHeader from "@/components/layout/PageHeader";
import Container from "@/components/ui/Container";
import SectionHeading from "@/components/ui/SectionHeading";
import FinanceCalculator from "@/components/forms/FinanceCalculator";
import FinanceFAQ from "@/app/finance/FinanceFAQ";

export const metadata: Metadata = {
  title: "Car Finance | Ideal Cars",
  description:
    "Flexible car finance options with competitive rates. Use our loan calculator to estimate repayments. All credit types considered.",
};

const benefits = [
  {
    icon: "%",
    title: "Competitive Rates",
    description:
      "We work with multiple lenders to find you the best interest rates available, ensuring you get the most affordable repayments.",
  },
  {
    icon: "~",
    title: "Flexible Terms",
    description:
      "Choose a loan term from 1 to 5 years to suit your budget. Adjust your deposit and repayment schedule to fit your lifestyle.",
  },
  {
    icon: "!",
    title: "Quick Approval",
    description:
      "Our streamlined application process means you can get pre-approved quickly, often within the same day.",
  },
  {
    icon: "*",
    title: "All Credit Types",
    description:
      "Whether you have excellent credit or are rebuilding, we have finance options available. Everyone deserves a fair go.",
  },
];

export default function FinancePage() {
  return (
    <>
      <PageHeader
        title="Car Finance"
        subtitle="Flexible finance solutions to get you on the road sooner."
      />

      {/* Benefits */}
      <section className="py-12 sm:py-16">
        <Container>
          <SectionHeading
            title="Why Finance With Us"
            subtitle="We make car finance simple, transparent, and accessible."
          />

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {benefits.map((benefit) => (
              <div
                key={benefit.title}
                className="rounded-xl border border-silver bg-white p-6 text-center shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-accent/10 text-2xl font-bold text-accent">
                  {benefit.icon}
                </div>
                <h3 className="mb-2 text-lg font-bold text-navy">
                  {benefit.title}
                </h3>
                <p className="text-sm text-silver-dark">
                  {benefit.description}
                </p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* Finance Calculator */}
      <section className="py-12 sm:py-16 bg-gray-50">
        <Container>
          <SectionHeading
            title="Finance Calculator"
            subtitle="Use our calculator to estimate your weekly and monthly repayments."
          />

          <div className="mx-auto max-w-4xl">
            <FinanceCalculator />
          </div>
        </Container>
      </section>

      {/* FAQ */}
      <section className="py-12 sm:py-16">
        <Container>
          <SectionHeading
            title="Frequently Asked Questions"
            subtitle="Common questions about car finance answered."
          />

          <div className="mx-auto max-w-3xl">
            <FinanceFAQ />
          </div>
        </Container>
      </section>
    </>
  );
}
