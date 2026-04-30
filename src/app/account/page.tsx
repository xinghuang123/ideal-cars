import Link from "next/link";
import { getCurrentCustomer } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function AccountPage() {
  // requireCustomer is enforced by the layout — we just read.
  const customer = await getCurrentCustomer();
  if (!customer) return null;

  const supabase = createClient();

  const [vehiclesRes, financeRes, servicesRes] = await Promise.all([
    supabase
      .from("customer_vehicles")
      .select("id", { count: "exact", head: true })
      .eq("customer_id", customer.userId),
    supabase
      .from("finance_applications")
      .select("id", { count: "exact", head: true })
      .eq("customer_id", customer.userId),
    supabase
      .from("service_records")
      .select("id, customer_vehicles!inner(customer_id)", {
        count: "exact",
        head: true,
      })
      .eq("customer_vehicles.customer_id", customer.userId),
  ]);

  const cards = [
    {
      title: "Personal Profile",
      description: "Update your name, phone, and address.",
      href: "/account/profile",
      stat: customer.profile?.full_name ? "Profile complete" : "Not set up yet",
    },
    {
      title: "Car Profile",
      description: "Vehicles you own — bought from us or elsewhere.",
      href: "/account/vehicles",
      stat: `${vehiclesRes.count ?? 0} vehicle${vehiclesRes.count === 1 ? "" : "s"}`,
    },
    {
      title: "Finance Record",
      description: "Your finance applications and their status.",
      href: "/account/finance",
      stat: `${financeRes.count ?? 0} application${financeRes.count === 1 ? "" : "s"}`,
    },
    {
      title: "Service & Repairs",
      description: "Your full service and repair history.",
      href: "/account/services",
      stat: `${servicesRes.count ?? 0} record${servicesRes.count === 1 ? "" : "s"}`,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-navy">My Account</h1>
        <p className="mt-1 text-sm text-silver-dark">
          Welcome back{customer.profile?.full_name ? `, ${customer.profile.full_name.split(" ")[0]}` : ""}.
        </p>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {cards.map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className="rounded-xl border border-silver bg-white p-5 shadow-sm transition-shadow hover:border-accent hover:shadow-md"
          >
            <h2 className="text-lg font-semibold text-navy">{card.title}</h2>
            <p className="mt-1 text-sm text-silver-dark">{card.description}</p>
            <p className="mt-3 text-sm font-medium text-accent">{card.stat} →</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
