import type { Metadata } from "next";
import Link from "next/link";
import PageHeader from "@/components/layout/PageHeader";
import Container from "@/components/ui/Container";
import SectionHeading from "@/components/ui/SectionHeading";
import Button from "@/components/ui/Button";
import { getSiteContent } from "@/lib/site-content";
import { getActiveServices } from "@/lib/services";
import { ServiceIconBadge } from "@/components/ui/ServiceIcon";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Service & Repairs | Ideal Cars",
  description:
    "Professional vehicle servicing, WOF inspections, mechanical repairs, and more. Trusted mechanics serving the community for over 10 years.",
};

export default async function ServicePage() {
  const [content, services] = await Promise.all([
    getSiteContent(),
    getActiveServices(),
  ]);
  return (
    <>
      <PageHeader
        title="Service & Repairs"
        subtitle={content.page_service_subtitle}
      />

      {/* Intro */}
      <section className="py-12 sm:py-16">
        <Container>
          <SectionHeading
            title={content.service_intro_heading}
            subtitle={content.service_intro_subtitle}
          />

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {services.map((service) => (
              <div
                key={service.id}
                className="flex flex-col rounded-xl border border-silver bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
              >
                <ServiceIconBadge
                  icon={service.icon}
                  imageUrl={service.icon_image_url}
                  className="mb-4 h-12 w-12"
                />

                <h3 className="mb-2 text-lg font-bold text-navy">
                  {service.title}
                </h3>
                <p className="mb-4 text-sm text-silver-dark">
                  {service.description}
                </p>

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
            {content.service_cta_heading}
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-silver">
            {content.service_cta_body}
          </p>
          <div className="mt-8">
            <Button asChild size="lg">
              <Link href="/contact">{content.service_cta_button_text}</Link>
            </Button>
          </div>
        </Container>
      </section>
    </>
  );
}
