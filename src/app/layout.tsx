import type { Metadata } from "next";
import localFont from "next/font/local";
import Script from "next/script";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";
import PublicChrome from "@/components/layout/PublicChrome";
import { GOOGLE_ADS_ID } from "@/lib/gtag";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://idealcarsltd.co.nz";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Ideal Cars - Quality Used Cars in New Zealand",
    template: "%s | Ideal Cars",
  },
  description:
    "Find your ideal second-hand car at Ideal Cars. Quality used vehicles, competitive prices, finance options, and full servicing in Auckland, New Zealand.",
  keywords: [
    "used cars NZ",
    "second hand cars Auckland",
    "car finance New Zealand",
    "Ideal Cars",
    "buy used car Auckland",
    "sell my car NZ",
  ],
  authors: [{ name: "Ideal Cars Ltd" }],
  openGraph: {
    type: "website",
    locale: "en_NZ",
    url: siteUrl,
    siteName: "Ideal Cars",
    title: "Ideal Cars - Quality Used Cars in New Zealand",
    description:
      "Quality used vehicles, competitive prices, finance options, and full servicing in Auckland, New Zealand.",
    images: [
      {
        url: "/images/logo-dark.png",
        width: 1200,
        height: 630,
        alt: "Ideal Cars",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Ideal Cars - Quality Used Cars in New Zealand",
    description:
      "Quality used vehicles, competitive prices, finance options, and full servicing.",
    images: ["/images/logo-dark.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`}
      >
        <PublicChrome>{children}</PublicChrome>
        <Analytics />
        <SpeedInsights />

        {/* Google tag (gtag.js) — Google Ads conversion tracking */}
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${GOOGLE_ADS_ID}`}
          strategy="afterInteractive"
        />
        <Script id="google-ads-gtag" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GOOGLE_ADS_ID}');
          `}
        </Script>
      </body>
    </html>
  );
}
