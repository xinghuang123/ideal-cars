import { getCurrentCustomer } from "@/lib/auth";
import PublicChromeShell from "./PublicChromeShell";

export default async function PublicChrome({
  children,
}: {
  children: React.ReactNode;
}) {
  const customer = await getCurrentCustomer();

  return (
    <PublicChromeShell
      userEmail={customer?.email ?? null}
      userName={customer?.profile?.full_name ?? null}
      isAdmin={customer?.isAdmin ?? false}
    >
      {children}
    </PublicChromeShell>
  );
}
