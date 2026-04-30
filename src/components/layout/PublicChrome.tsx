import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ChatbotFAB from "@/components/ui/ChatbotFAB";
import CookieNotice from "@/components/layout/CookieNotice";
import PublicChromeShell from "./PublicChromeShell";
import { getCurrentCustomer } from "@/lib/auth";

export default async function PublicChrome({
  children,
}: {
  children: React.ReactNode;
}) {
  const customer = await getCurrentCustomer();

  return (
    <PublicChromeShell
      navbar={
        <Navbar
          userEmail={customer?.email ?? null}
          userName={customer?.profile?.full_name ?? null}
          isAdmin={customer?.isAdmin ?? false}
        />
      }
      footer={<Footer />}
      chatbot={<ChatbotFAB />}
      cookieNotice={<CookieNotice />}
    >
      {children}
    </PublicChromeShell>
  );
}
