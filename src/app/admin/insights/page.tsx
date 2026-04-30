import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import EngagementChart from "./EngagementChart";

export const dynamic = "force-dynamic";

interface DailyCount {
  day: string;
  count: number;
}

function emptyDays(n: number): DailyCount[] {
  const days: DailyCount[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    days.push({ day: d.toISOString().slice(0, 10), count: 0 });
  }
  return days;
}

function bucketByDay(rows: { created_at?: string; viewed_at?: string }[], n: number): DailyCount[] {
  const days = emptyDays(n);
  const idx: Record<string, number> = Object.fromEntries(
    days.map((d, i) => [d.day, i]),
  );
  for (const r of rows) {
    const ts = r.created_at ?? r.viewed_at;
    if (!ts) continue;
    const day = ts.slice(0, 10);
    if (idx[day] !== undefined) days[idx[day]].count++;
  }
  return days;
}

export default async function InsightsPage() {
  const supabase = createClient();
  const sinceIso = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

  const [
    customerCountRes,
    customerSignupsRes,
    contactRes,
    vehicleEnqRes,
    sellRes,
    financeRes,
    chatSessionsRes,
    chatMessagesRes,
    vehicleViewsRes,
    vehiclesByStatusRes,
    topVehiclesRes,
  ] = await Promise.all([
    supabase
      .from("customer_profiles")
      .select("id", { count: "exact", head: true }),
    supabase
      .from("customer_profiles")
      .select("created_at")
      .gte("created_at", sinceIso),
    supabase
      .from("contact_enquiries")
      .select("created_at")
      .gte("created_at", sinceIso),
    supabase
      .from("vehicle_enquiries")
      .select("created_at")
      .gte("created_at", sinceIso),
    supabase
      .from("sell_car_enquiries")
      .select("created_at")
      .gte("created_at", sinceIso),
    supabase
      .from("finance_applications")
      .select("created_at")
      .gte("created_at", sinceIso),
    supabase
      .from("chat_sessions")
      .select("started_at")
      .gte("started_at", sinceIso),
    supabase
      .from("chat_messages")
      .select("id", { count: "exact", head: true })
      .gte("created_at", sinceIso),
    supabase
      .from("vehicle_views")
      .select("viewed_at")
      .gte("viewed_at", sinceIso),
    supabase
      .from("vehicles")
      .select("status"),
    supabase
      .from("vehicles")
      .select("id, year, make, model, view_count, status")
      .order("view_count", { ascending: false })
      .limit(5),
  ]);

  const totalCustomers = customerCountRes.count ?? 0;
  const signupsByDay = bucketByDay(
    (customerSignupsRes.data ?? []) as { created_at: string }[],
    30,
  );
  const viewsByDay = bucketByDay(
    (vehicleViewsRes.data ?? []) as { viewed_at: string }[],
    30,
  );
  const enquiriesByDay = bucketByDay(
    [
      ...((contactRes.data ?? []) as { created_at: string }[]),
      ...((vehicleEnqRes.data ?? []) as { created_at: string }[]),
      ...((sellRes.data ?? []) as { created_at: string }[]),
      ...((financeRes.data ?? []) as { created_at: string }[]),
    ],
    30,
  );

  const totalEnquiries30d =
    (contactRes.data?.length ?? 0) +
    (vehicleEnqRes.data?.length ?? 0) +
    (sellRes.data?.length ?? 0) +
    (financeRes.data?.length ?? 0);

  const totalViews30d = vehicleViewsRes.data?.length ?? 0;
  const totalSignups30d = customerSignupsRes.data?.length ?? 0;
  const chatSessions30d = chatSessionsRes.data?.length ?? 0;
  const chatMessages30d = chatMessagesRes.count ?? 0;
  const avgMessagesPerSession =
    chatSessions30d > 0 ? chatMessages30d / chatSessions30d : 0;

  const statusCounts: Record<string, number> = {};
  for (const v of (vehiclesByStatusRes.data ?? []) as { status: string }[]) {
    statusCounts[v.status] = (statusCounts[v.status] ?? 0) + 1;
  }
  const totalVehicles = Object.values(statusCounts).reduce((a, b) => a + b, 0);
  const soldCount = statusCounts.sold ?? 0;
  const conversionRate =
    totalViews30d > 0 ? (totalEnquiries30d / totalViews30d) * 100 : 0;

  // Try to get total auth user count (excluding admins) for visitors-with-account stat.
  let nonAdminUsers = 0;
  try {
    const admin = createAdminClient();
    const { data } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
    nonAdminUsers = (data?.users ?? []).filter(
      (u) =>
        (u.app_metadata as Record<string, unknown> | undefined)?.role !==
        "admin",
    ).length;
  } catch {
    /* ignore */
  }

  const topVehicles = (topVehiclesRes.data ?? []) as {
    id: string;
    year: number;
    make: string;
    model: string;
    view_count: number;
    status: string;
  }[];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-navy">Insights</h1>
          <p className="mt-1 text-sm text-silver-dark">
            Customer engagement and site performance — last 30 days
          </p>
        </div>
        <Link
          href="/admin/insights/performance"
          className="rounded-md border border-silver px-3 py-1.5 text-sm font-medium text-navy hover:bg-gray-50"
        >
          Performance →
        </Link>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat
          label="Registered customers"
          value={totalCustomers.toLocaleString("en-NZ")}
          sub={`${totalSignups30d} new in last 30d`}
        />
        <Stat
          label="Vehicle page views"
          value={totalViews30d.toLocaleString("en-NZ")}
          sub="last 30d"
        />
        <Stat
          label="Total enquiries"
          value={totalEnquiries30d.toLocaleString("en-NZ")}
          sub="contact + vehicle + sell + finance"
        />
        <Stat
          label="Chatbot sessions"
          value={chatSessions30d.toLocaleString("en-NZ")}
          sub={`${avgMessagesPerSession.toFixed(1)} avg msgs/session`}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <EngagementChart
          title="Vehicle views per day"
          data={viewsByDay}
          accent="#5BC0EB"
        />
        <EngagementChart
          title="Enquiries per day"
          data={enquiriesByDay}
          accent="#10b981"
        />
        <EngagementChart
          title="Customer signups per day"
          data={signupsByDay}
          accent="#a855f7"
        />
        <div className="rounded-xl border border-silver bg-white p-5">
          <h3 className="text-sm font-semibold text-navy">Inventory</h3>
          <p className="mt-1 text-xs text-silver-dark">
            {totalVehicles} vehicle{totalVehicles === 1 ? "" : "s"} in the system
          </p>
          <div className="mt-4 space-y-2 text-sm">
            <Row label="Available" value={statusCounts.available ?? 0} />
            <Row label="Featured" value={statusCounts.special ?? 0} />
            <Row label="Sold" value={soldCount} />
          </div>
          <div className="mt-5 border-t border-silver pt-4">
            <p className="text-xs text-silver-dark">Conversion (last 30d)</p>
            <p className="mt-1 text-2xl font-bold text-navy">
              {conversionRate.toFixed(1)}%
            </p>
            <p className="mt-1 text-xs text-silver-dark">
              {totalEnquiries30d} enquiries from {totalViews30d} views
            </p>
          </div>
        </div>
      </div>

      {/* Top vehicles */}
      <div className="rounded-xl border border-silver bg-white p-5">
        <h3 className="text-sm font-semibold text-navy">Top viewed vehicles</h3>
        {topVehicles.length === 0 || topVehicles[0].view_count === 0 ? (
          <p className="mt-3 text-sm text-silver-dark">
            No views recorded yet. Once customers browse vehicle detail pages,
            top-viewed inventory will appear here.
          </p>
        ) : (
          <ul className="mt-3 space-y-2">
            {topVehicles
              .filter((v) => v.view_count > 0)
              .map((v) => (
                <li
                  key={v.id}
                  className="flex items-center justify-between rounded-md border border-silver bg-white px-3 py-2 text-sm"
                >
                  <Link
                    href={`/buy/${v.id}`}
                    target="_blank"
                    className="font-medium text-navy hover:text-accent"
                  >
                    {v.year} {v.make} {v.model}
                  </Link>
                  <span className="text-silver-dark">
                    {v.view_count.toLocaleString("en-NZ")} views
                  </span>
                </li>
              ))}
          </ul>
        )}
      </div>

      <p className="text-xs text-silver-dark">
        {nonAdminUsers} total non-admin user account{nonAdminUsers === 1 ? "" : "s"}{" "}
        on file.
      </p>
    </div>
  );
}

function Stat({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div className="rounded-xl border border-silver bg-white p-4">
      <p className="text-xs uppercase tracking-wide text-silver-dark">{label}</p>
      <p className="mt-1 text-2xl font-bold text-navy">{value}</p>
      {sub && <p className="mt-1 text-xs text-silver-dark">{sub}</p>}
    </div>
  );
}

function Row({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-silver-dark">{label}</span>
      <span className="font-semibold text-navy">{value}</span>
    </div>
  );
}
