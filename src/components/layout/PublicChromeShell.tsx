"use client";

import { usePathname } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ChatbotFAB from "@/components/ui/ChatbotFAB";
import CookieNotice from "@/components/layout/CookieNotice";

interface Props {
  children: React.ReactNode;
  userEmail: string | null;
  userName: string | null;
  isAdmin: boolean;
}

export default function PublicChromeShell({
  children,
  userEmail,
  userName,
  isAdmin,
}: Props) {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith("/admin") ?? false;

  if (isAdminRoute) {
    return <main className="min-h-screen">{children}</main>;
  }

  return (
    <>
      <Navbar userEmail={userEmail} userName={userName} isAdmin={isAdmin} />
      <main className="min-h-screen">{children}</main>
      <Footer />
      <ChatbotFAB />
      <CookieNotice />
    </>
  );
}
