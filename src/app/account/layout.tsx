import { requireCustomer } from "@/lib/auth";
import AccountSidebar from "./AccountSidebar";

export default async function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const customer = await requireCustomer();

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-8 md:flex-row md:px-6 lg:px-8">
      <AccountSidebar
        email={customer.email}
        fullName={customer.profile?.full_name ?? null}
      />
      <main className="flex-1">{children}</main>
    </div>
  );
}
