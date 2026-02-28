import type { Metadata } from "next";
import PageHeader from "@/components/layout/PageHeader";
import Container from "@/components/ui/Container";
import SectionHeading from "@/components/ui/SectionHeading";
import SellCarForm from "@/components/forms/SellCarForm";

export const metadata: Metadata = {
  title: "Sell Your Car | Ideal Cars",
  description:
    "Sell your car quickly and easily with Ideal Cars. Get a fair valuation, hassle-free process, and fast payment. Trusted NZ car buyer.",
};

const steps = [
  {
    number: "1",
    title: "Fill in Your Details",
    description:
      "Complete the form below with your contact information and vehicle details. The more details you provide, the more accurate your valuation will be.",
  },
  {
    number: "2",
    title: "We Assess Your Vehicle",
    description:
      "Our team will review your submission and may arrange a time to inspect your vehicle in person. We provide fair, market-based valuations.",
  },
  {
    number: "3",
    title: "Get Paid",
    description:
      "Once we agree on a price, we handle all the paperwork and you get paid promptly. It really is that simple.",
  },
];

export default function SellPage() {
  return (
    <>
      <PageHeader
        title="Sell Your Car"
        subtitle="Get a fair price for your vehicle with our simple three-step process."
      />

      {/* How It Works */}
      <section className="py-12 sm:py-16 bg-gray-50">
        <Container>
          <SectionHeading
            title="How It Works"
            subtitle="Selling your car has never been easier. Follow these three simple steps."
          />

          <div className="grid gap-8 md:grid-cols-3">
            {steps.map((step) => (
              <div key={step.number} className="text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-accent text-xl font-bold text-white">
                  {step.number}
                </div>
                <h3 className="mb-2 text-lg font-bold text-navy">
                  {step.title}
                </h3>
                <p className="text-silver-dark">{step.description}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* Sell Car Form */}
      <section className="py-12 sm:py-16">
        <Container>
          <SectionHeading
            title="Vehicle Information"
            subtitle="Please fill in the details below and we will get back to you with a valuation."
          />

          <div className="mx-auto max-w-4xl rounded-xl border border-silver bg-white p-6 shadow-sm sm:p-8">
            <SellCarForm />
          </div>
        </Container>
      </section>
    </>
  );
}
