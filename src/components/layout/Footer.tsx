import Link from "next/link";
import Image from "next/image";
import NewsletterForm from "@/components/layout/NewsletterForm";
import SocialLinks from "@/components/layout/SocialLinks";
import { getSiteContent } from "@/lib/site-content";
import { toTelHref } from "@/lib/utils";

const quickLinks = [
  { href: "/", label: "Home" },
  { href: "/buy", label: "Buy a Car" },
  { href: "/sell", label: "Sell my Car" },
  { href: "/finance", label: "Finance" },
  { href: "/service", label: "Service & Repairs" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export default async function Footer() {
  const content = await getSiteContent();

  return (
    <footer className="bg-navy border-t border-navy-light">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <Link href="/">
              <Image
                src="/images/logo-transparent.png"
                alt="Ideal Cars"
                width={180}
                height={54}
                className="h-10 w-auto"
              />
            </Link>
            <p className="mt-3 text-sm leading-relaxed text-silver-dark">
              {content.tagline}
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-silver">
              Quick Links
            </h3>
            <ul className="mt-4 flex flex-col gap-2">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-silver-dark transition-colors hover:text-accent"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-silver">
              Contact Us
            </h3>
            <ul className="mt-4 flex flex-col gap-3">
              <li className="flex items-start gap-2 text-sm text-silver-dark">
                <svg
                  className="mt-0.5 h-4 w-4 shrink-0 text-accent"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z"
                  />
                </svg>
                <a
                  href={toTelHref(content.phone)}
                  className="transition-colors hover:text-accent"
                >
                  {content.phone}
                </a>
              </li>
              <li className="flex items-start gap-2 text-sm text-silver-dark">
                <svg
                  className="mt-0.5 h-4 w-4 shrink-0 text-accent"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
                  />
                </svg>
                <a
                  href={`mailto:${content.email}`}
                  className="transition-colors hover:text-accent"
                >
                  {content.email}
                </a>
              </li>
              <li className="flex items-start gap-2 text-sm text-silver-dark">
                <svg
                  className="mt-0.5 h-4 w-4 shrink-0 text-accent"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"
                  />
                </svg>
                <span>{content.address}</span>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-silver">
              Newsletter
            </h3>
            <p className="mt-4 text-sm text-silver-dark">
              Stay up to date with our latest deals and news.
            </p>
            <NewsletterForm />
          </div>
        </div>
      </div>

      <div className="border-t border-navy-light">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
            <p className="text-xs text-silver-dark">
              &copy; {new Date().getFullYear()} Ideal Cars Ltd. All rights reserved.{" "}
              <Link
                href="/privacy"
                className="ml-2 transition-colors hover:text-accent"
              >
                Privacy
              </Link>
              <span className="mx-1">·</span>
              <Link
                href="/terms"
                className="transition-colors hover:text-accent"
              >
                Terms
              </Link>
            </p>

            <SocialLinks content={content} />
          </div>
        </div>
      </div>
    </footer>
  );
}
