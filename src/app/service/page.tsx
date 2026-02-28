import type { Metadata } from "next";
import Link from "next/link";
import PageHeader from "@/components/layout/PageHeader";
import Container from "@/components/ui/Container";
import SectionHeading from "@/components/ui/SectionHeading";
import Button from "@/components/ui/Button";
import { services } from "@/data/services";

export const metadata: Metadata = {
  title: "Service & Repairs | Ideal Cars",
  description:
    "Professional vehicle servicing, WOF inspections, mechanical repairs, and more. Trusted mechanics serving the community for over 10 years.",
};

const iconMap: Record<string, string> = {
  "shield-check": "S",
  wrench: "W",
  cog: "M",
  circle: "T",
  search: "P",
  zap: "E",
};

export default function ServicePage() {
  return (
    <>
      <PageHeader
        title="Service & Repairs"
        subtitle="Professional vehicle servicing and repairs by experienced mechanics."
      />

      {/* Intro */}
      <section className="py-12 sm:py-16">
        <Container>
          <SectionHeading
            title="Our Services"
            subtitle="From routine maintenance to complex repairs, our qualified mechanics keep your vehicle running at its best."
          />

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {services.map((service) => (
              <div
                key={service.id}
                className="flex flex-col rounded-xl border border-silver bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
              >
                {/* Icon placeholder */}
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-accent/10 text-xl font-bold text-accent">
                  {iconMap[service.icon] || service.title.charAt(0)}
                </div>

                <h3 className="mb-2 text-lg font-bold text-navy">
                  {service.title}
                </h3>
                <p className="mb-4 text-sm text-silver-dark">
                  {service.description}
                </p>

                {/* Feature list */}
                <ul className="mt-auto space-y-2">
                  {service.features.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-start gap-2 text-sm text-navy"
                    >
                      <svg
                        className="mt-0.5 h-4 w-4 shrink-0 text-accent"
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
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* CTA */}
      <section className="bg-navy py-12 sm:py-16">
        <Container className="text-center">
          <h2 className="text-3xl font-bold text-white sm:text-4xl">
            Ready to Book a Service?
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-silver">
            Get in touch with our team to schedule your next service or repair.
            We offer competitive pricing and quality workmanship.
          </p>
          <div className="mt-8">
            <Button asChild size="lg">
              <Link href="/contact">Book a Service</Link>
            </Button>
          </div>
        </Container>
      </section>
    </>
  );
}
