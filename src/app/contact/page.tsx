import type { Metadata } from "next";
import PageHeader from "@/components/layout/PageHeader";
import Container from "@/components/ui/Container";
import ContactForm from "@/components/forms/ContactForm";
import { getSiteContent } from "@/lib/site-content";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Contact Us | Ideal Cars",
  description:
    "Get in touch with Ideal Cars. Call, email, or visit us. We are here to help with buying, selling, finance, and servicing.",
};

export default async function ContactPage() {
  const content = await getSiteContent();
  const hours = [
    { day: "Mon – Fri", time: content.hours_weekday.replace(/^.*?:\s*/, "") },
    { day: "Saturday", time: content.hours_saturday.replace(/^.*?:\s*/, "") },
    { day: "Sunday", time: content.hours_sunday.replace(/^.*?:\s*/, "") },
  ];
  return (
    <>
      <PageHeader
        title="Contact Us"
        subtitle="We would love to hear from you. Get in touch with our friendly team."
      />

      <section className="py-12 sm:py-16">
        <Container>
          <div className="grid gap-10 lg:grid-cols-3">
            {/* Contact Form - 2/3 width */}
            <div className="lg:col-span-2">
              <div className="rounded-xl border border-silver bg-white p-6 shadow-sm sm:p-8">
                <h2 className="mb-6 text-2xl font-bold text-navy">
                  Send Us a Message
                </h2>
                <ContactForm />
              </div>
            </div>

            {/* Business Info - 1/3 width */}
            <div className="space-y-6">
              {/* Phone */}
              <div className="rounded-xl border border-silver bg-white p-6 shadow-sm">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10">
                  <svg
                    className="h-5 w-5 text-accent"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                    />
                  </svg>
                </div>
                <h3 className="font-bold text-navy">Phone</h3>
                <a
                  href={content.phone_href}
                  className="mt-1 block text-silver-dark hover:text-accent transition-colors"
                >
                  {content.phone}
                </a>
              </div>

              {/* Email */}
              <div className="rounded-xl border border-silver bg-white p-6 shadow-sm">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10">
                  <svg
                    className="h-5 w-5 text-accent"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <h3 className="font-bold text-navy">Email</h3>
                <a
                  href={`mailto:${content.email}`}
                  className="mt-1 block text-silver-dark hover:text-accent transition-colors"
                >
                  {content.email}
                </a>
              </div>

              {/* Address */}
              <div className="rounded-xl border border-silver bg-white p-6 shadow-sm">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10">
                  <svg
                    className="h-5 w-5 text-accent"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                </div>
                <h3 className="font-bold text-navy">Address</h3>
                <p className="mt-1 text-silver-dark">{content.address}</p>
              </div>

              {/* Opening Hours */}
              <div className="rounded-xl border border-silver bg-white p-6 shadow-sm">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10">
                  <svg
                    className="h-5 w-5 text-accent"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <h3 className="font-bold text-navy">Opening Hours</h3>
                <ul className="mt-2 space-y-1">
                  {hours.map((h) => (
                    <li
                      key={h.day}
                      className="flex justify-between text-sm text-silver-dark"
                    >
                      <span>{h.day}</span>
                      <span className="font-medium text-navy">{h.time}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Social Media */}
              <div className="rounded-xl border border-silver bg-white p-6 shadow-sm">
                <h3 className="mb-3 font-bold text-navy">Follow Us</h3>
                <div className="flex gap-3">
                  <a
                    href="#"
                    aria-label="Facebook"
                    className="flex h-10 w-10 items-center justify-center rounded-lg bg-navy text-white transition-colors hover:bg-accent"
                  >
                    <span className="text-sm font-bold">f</span>
                  </a>
                  <a
                    href="#"
                    aria-label="Instagram"
                    className="flex h-10 w-10 items-center justify-center rounded-lg bg-navy text-white transition-colors hover:bg-accent"
                  >
                    <span className="text-sm font-bold">in</span>
                  </a>
                  <a
                    href="#"
                    aria-label="YouTube"
                    className="flex h-10 w-10 items-center justify-center rounded-lg bg-navy text-white transition-colors hover:bg-accent"
                  >
                    <span className="text-sm font-bold">yt</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Map Placeholder */}
      <section className="pb-12 sm:pb-16">
        <Container>
          <div className="flex h-80 items-center justify-center rounded-xl bg-gray-200">
            <div className="text-center">
              <svg
                className="mx-auto mb-2 h-12 w-12 text-silver-dark"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              <p className="text-lg font-semibold text-silver-dark">
                Map — {content.address}
              </p>
              <p className="text-sm text-silver-dark">
                Google Maps integration placeholder
              </p>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
