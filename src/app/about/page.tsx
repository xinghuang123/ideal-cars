import type { Metadata } from "next";
import Image from "next/image";
import PageHeader from "@/components/layout/PageHeader";
import Container from "@/components/ui/Container";
import SectionHeading from "@/components/ui/SectionHeading";
import { getSiteContent } from "@/lib/site-content";
import { getActiveAboutValues } from "@/lib/about-values";
import { getActiveAboutTeam } from "@/lib/about-team";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "About Us | Ideal Cars",
  description:
    "Learn about Ideal Cars - a trusted, family-owned New Zealand car dealership with over 10 years of experience. Quality vehicles and honest service.",
};

const stats = [
  { value: "500+", label: "Cars Sold" },
  { value: "10+", label: "Years Experience" },
  { value: "4.8", label: "Star Rating" },
  { value: "100%", label: "NZ Owned" },
];

function splitParagraphs(text: string | null | undefined): string[] {
  if (!text) return [];
  return text
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);
}

export default async function AboutPage() {
  const [content, values, team] = await Promise.all([
    getSiteContent(),
    getActiveAboutValues(),
    getActiveAboutTeam(),
  ]);
  const storyParagraphs = [
    ...splitParagraphs(content.about_intro),
    ...splitParagraphs(content.our_story_body),
  ];
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
            {storyParagraphs.map((p, idx) => (
              <p key={idx}>{p}</p>
            ))}
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
                key={value.id}
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
            {team.map((member) => {
              const initials = member.name
                .split(" ")
                .filter(Boolean)
                .map((n) => n[0])
                .slice(0, 2)
                .join("")
                .toUpperCase();
              return (
              <div
                key={member.id}
                className="rounded-xl border border-silver bg-white p-6 text-center shadow-sm"
              >
                <div className="relative mx-auto mb-4 h-24 w-24 overflow-hidden rounded-full bg-gray-200">
                  {member.photo_url ? (
                    <Image
                      src={member.photo_url}
                      alt={member.name}
                      fill
                      className="object-cover"
                      sizes="96px"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-3xl font-bold text-silver-dark">
                      {initials || "—"}
                    </div>
                  )}
                </div>
                <h3 className="text-lg font-bold text-navy">{member.name}</h3>
                <p className="text-sm text-silver-dark">{member.role}</p>
                {member.bio?.trim() && (
                  <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-navy/70">
                    {member.bio}
                  </p>
                )}
              </div>
              );
            })}
          </div>
        </Container>
      </section>
    </>
  );
}
