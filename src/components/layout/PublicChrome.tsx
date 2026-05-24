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

  // On the public-facing site, admin sessions are presented as signed-out
  // so the customer portal is fully separated from the admin portal in the
  // UI. The session itself stays valid — visiting /admin still works without
  // re-logging-in.
  const navbarUser = customer && !customer.isAdmin ? customer : null;

  return (
    <PublicChromeShell
      navbar={
        <Navbar
          userEmail={navbarUser?.email ?? null}
          userName={navbarUser?.profile?.full_name ?? null}
          isAdmin={false}
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
