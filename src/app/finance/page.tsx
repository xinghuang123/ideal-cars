import type { Metadata } from "next";
import PageHeader from "@/components/layout/PageHeader";
import Container from "@/components/ui/Container";
import SectionHeading from "@/components/ui/SectionHeading";
import FinanceCalculator from "@/components/forms/FinanceCalculator";
import FinanceApplicationForm from "@/components/forms/FinanceApplicationForm";
import FinanceFAQ from "@/app/finance/FinanceFAQ";
import { getCurrentCustomer } from "@/lib/auth";
import { getSiteContent } from "@/lib/site-content";
import { getActiveFinanceBenefits } from "@/lib/finance-benefits";
import { getActiveFinanceFaqs } from "@/lib/finance-faqs";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Car Finance | Ideal Cars",
  description:
    "Flexible car finance options with competitive rates. Use our loan calculator to estimate repayments. All credit types considered.",
};

export default async function FinancePage() {
  const [customer, content, benefits, faqs] = await Promise.all([
    getCurrentCustomer(),
    getSiteContent(),
    getActiveFinanceBenefits(),
    getActiveFinanceFaqs(),
  ]);
  return (
    <>
      <PageHeader title="Car Finance" subtitle={content.page_finance_subtitle} />

      {/* Benefits */}
      <section className="py-12 sm:py-16">
        <Container>
          <SectionHeading
            title={content.finance_benefits_heading}
            subtitle={content.finance_benefits_subtitle}
          />

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {benefits.map((benefit) => (
              <div
                key={benefit.id}
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
            title={content.finance_calculator_heading}
            subtitle={content.finance_calculator_subtitle}
          />

          <div className="mx-auto max-w-4xl">
            <FinanceCalculator />
          </div>
        </Container>
      </section>

      {/* Finance Application */}
      <section className="py-12 sm:py-16">
        <Container>
          <SectionHeading
            title={content.finance_apply_heading}
            subtitle={content.finance_apply_subtitle}
          />
          <div className="mx-auto max-w-3xl">
            <FinanceApplicationForm
              defaultName={customer?.profile?.full_name ?? ""}
              defaultEmail={customer?.email ?? ""}
              defaultPhone={customer?.profile?.phone ?? ""}
            />
          </div>
        </Container>
      </section>

      {/* FAQ */}
      <section className="py-12 sm:py-16">
        <Container>
          <SectionHeading
            title={content.finance_faq_heading}
            subtitle={content.finance_faq_subtitle}
          />

          <div className="mx-auto max-w-3xl">
            <FinanceFAQ faqs={faqs} />
          </div>
        </Container>
      </section>
    </>
  );
}
