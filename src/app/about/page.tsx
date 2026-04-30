import type { Metadata } from "next";
import PageHeader from "@/components/layout/PageHeader";
import Container from "@/components/ui/Container";
import SectionHeading from "@/components/ui/SectionHeading";
import { getSiteContent } from "@/lib/site-content";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "About Us | Ideal Cars",
  description:
    "Learn about Ideal Cars - a trusted, family-owned New Zealand car dealership with over 10 years of experience. Quality vehicles and honest service.",
};

const values = [
  {
    title: "Transparency",
    description:
      "No hidden fees, no surprises. We believe in honest pricing and clear communication at every step of the process.",
  },
  {
    title: "Quality",
    description:
      "Every vehicle we sell is thoroughly inspected and comes with a comprehensive vehicle history. We stand behind what we sell.",
  },
  {
    title: "Customer First",
    description:
      "Your satisfaction is our priority. We listen to your needs and work hard to find the perfect vehicle and deal for you.",
  },
  {
    title: "Community",
    description:
      "We are proud to be part of the local community. We support local events and charities, and treat every customer like family.",
  },
];

const stats = [
  { value: "500+", label: "Cars Sold" },
  { value: "10+", label: "Years Experience" },
  { value: "4.8", label: "Star Rating" },
  { value: "100%", label: "NZ Owned" },
];

const team = [
  { name: "James Mitchell", role: "Founder & Director" },
  { name: "Sarah Chen", role: "Sales Manager" },
  { name: "David Thompson", role: "Service Manager" },
];

export default async function AboutPage() {
  const content = await getSiteContent();
  return (
    <>
      <PageHeader
        title="About Ideal Cars"
        subtitle="Your trusted local car dealership, proudly serving New Zealand."
      />

      {/* Our Story */}
      <section className="py-12 sm:py-16">
        <Container>
          <SectionHeading title="Our Story" />
          <div className="mx-auto max-w-3xl space-y-4 text-silver-dark">
            <p>{content.about_intro}</p>
            <p>
              What started as a small yard with a handful of vehicles has grown
              into a full-service dealership offering quality used cars, vehicle
              finance, servicing, and repairs. Despite our growth, we have never
              lost sight of what matters most - putting our customers first and
              delivering genuine value. Whether you are buying your first car or
              upgrading your family vehicle, our friendly team is here to help
              every step of the way.
            </p>
          </div>
        </Container>
      </section>

      {/* Our Values */}
      <section className="py-12 sm:py-16 bg-gray-50">
        <Container>
          <SectionHeading
            title="Our Values"
            subtitle="The principles that guide everything we do."
          />

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {values.map((value) => (
              <div
                key={value.title}
                className="rounded-xl border border-silver bg-white p-6 text-center shadow-sm"
              >
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-accent/10 text-xl font-bold text-accent">
                  {value.title.charAt(0)}
                </div>
                <h3 className="mb-2 text-lg font-bold text-navy">
                  {value.title}
                </h3>
                <p className="text-sm text-silver-dark">{value.description}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* Stats */}
      <section className="bg-navy py-12 sm:py-16">
        <Container>
          <div className="grid grid-cols-2 gap-8 lg:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-3xl font-bold text-accent sm:text-4xl">
                  {stat.value}
                </p>
                <p className="mt-1 text-sm font-medium text-silver sm:text-base">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* Team */}
      <section className="py-12 sm:py-16">
        <Container>
          <SectionHeading
            title="Meet Our Team"
            subtitle="Our friendly team is here to help you find the perfect car."
          />

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 max-w-4xl mx-auto">
            {team.map((member) => (
              <div
                key={member.name}
                className="rounded-xl border border-silver bg-white p-6 text-center shadow-sm"
              >
                {/* Avatar placeholder */}
                <div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-gray-200 text-3xl font-bold text-silver-dark">
                  {member.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </div>
                <h3 className="text-lg font-bold text-navy">{member.name}</h3>
                <p className="text-sm text-silver-dark">{member.role}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>
    </>
  );
}
