"use client";

import { usePathname } from "next/navigation";

interface Props {
  children: React.ReactNode;
  navbar: React.ReactNode;
  footer: React.ReactNode;
  chatbot: React.ReactNode;
  cookieNotice: React.ReactNode;
}

export default function PublicChromeShell({
  children,
  navbar,
  footer,
  chatbot,
  cookieNotice,
}: Props) {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith("/admin") ?? false;

  if (isAdminRoute) {
    return <main className="min-h-screen">{children}</main>;
  }

  return (
    <>
      {navbar}
      <main className="min-h-screen">{children}</main>
      {footer}
      {chatbot}
      {cookieNotice}
    </>
  );
}
