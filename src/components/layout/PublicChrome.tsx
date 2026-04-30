import { headers } from "next/headers";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ChatbotFAB from "@/components/ui/ChatbotFAB";
import CookieNotice from "@/components/layout/CookieNotice";
import { getCurrentCustomer } from "@/lib/auth";

export default async function PublicChrome({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = headers().get("x-pathname") ?? "";
  const isAdmin = pathname.startsWith("/admin");

  if (isAdmin) {
    return <main className="min-h-screen">{children}</main>;
  }

  const customer = await getCurrentCustomer();

  return (
    <>
      <Navbar
        userEmail={customer?.email ?? null}
        userName={customer?.profile?.full_name ?? null}
        isAdmin={customer?.isAdmin ?? false}
      />
      <main className="min-h-screen">{children}</main>
      <Footer />
      <ChatbotFAB />
      <CookieNotice />
    </>
  );
}
