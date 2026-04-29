import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import PublicChrome from "@/components/layout/PublicChrome";

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

export const metadata: Metadata = {
  title: {
    default: "Ideal Cars - Quality Used Cars in New Zealand",
    template: "%s | Ideal Cars",
  },
  description:
    "Find your ideal second-hand car at Ideal Cars. Quality used vehicles, competitive prices, finance options, and full servicing in Auckland, New Zealand.",
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
      </body>
    </html>
  );
}
