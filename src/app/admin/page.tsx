import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

async function getCounts() {
  const supabase = createClient();
  const tables = [
    "contact_enquiries",
    "sell_car_enquiries",
    "newsletter_subscribers",
    "vehicles",
  ] as const;

  const counts: Record<string, number> = {};
  for (const table of tables) {
    const { count } = await supabase
      .from(table)
      .select("*", { count: "exact", head: true });
    counts[table] = count ?? 0;
  }
  return counts;
}

async function getRecentEnquiries() {
  const supabase = createClient();
  const { data } = await supabase
    .from("contact_enquiries")
    .select("id, name, email, subject, created_at, status")
    .order("created_at", { ascending: false })
    .limit(10);
  return data ?? [];
}

const cards = [
  { table: "contact_enquiries", label: "Contact Enquiries", href: "/admin/contact" },
  { table: "sell_car_enquiries", label: "Sell Car Requests", href: "/admin/sell-requests" },
  { table: "newsletter_subscribers", label: "Newsletter Subscribers", href: "/admin/subscribers" },
  { table: "vehicles", label: "Vehicles in Inventory", href: "/admin/vehicles" },
] as const;

export default async function AdminDashboard() {
  const [counts, recent] = await Promise.all([getCounts(), getRecentEnquiries()]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-navy">Dashboard</h1>
        <p className="mt-1 text-sm text-silver-dark">
          Overview of recent activity.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <Link
            key={card.table}
            href={card.href}
            className="rounded-xl border border-silver bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
          >
            <p className="text-sm font-medium text-silver-dark">{card.label}</p>
            <p className="mt-1 text-3xl font-bold text-navy">
              {counts[card.table] ?? 0}
            </p>
          </Link>
        ))}
      </div>

      <div className="rounded-xl border border-silver bg-white shadow-sm">
        <div className="border-b border-silver px-6 py-4">
          <h2 className="font-bold text-navy">Recent Contact Enquiries</h2>
        </div>
        {recent.length === 0 ? (
          <p className="px-6 py-8 text-center text-sm text-silver-dark">
            No enquiries yet.
          </p>
        ) : (
          <ul className="divide-y divide-silver">
            {recent.map((e) => (
              <li
                key={e.id}
                className="flex items-center justify-between px-6 py-3 text-sm"
              >
                <div>
                  <p className="font-medium text-navy">{e.name}</p>
                  <p className="text-silver-dark">
                    {e.email} · {e.subject}
                  </p>
                </div>
                <div className="text-right text-xs text-silver-dark">
                  <p>{new Date(e.created_at).toLocaleString("en-NZ")}</p>
                  <p className="mt-1 font-medium uppercase">{e.status}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
