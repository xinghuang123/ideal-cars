import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

interface SiteHealth {
  vehicles: number;
  customers: number;
  enquiriesAllTime: number;
  oldestEnquiry: string | null;
  serviceRecords: number;
  buildSha: string;
  buildTime: string;
}

async function loadHealth(): Promise<SiteHealth> {
  const supabase = createClient();
  const [v, c, contact, vehicleE, sell, finance, enqOldest, sr] = await Promise.all([
    supabase.from("vehicles").select("id", { count: "exact", head: true }),
    supabase
      .from("customer_profiles")
      .select("id", { count: "exact", head: true }),
    supabase
      .from("contact_enquiries")
      .select("id", { count: "exact", head: true }),
    supabase
      .from("vehicle_enquiries")
      .select("id", { count: "exact", head: true }),
    supabase
      .from("sell_car_enquiries")
      .select("id", { count: "exact", head: true }),
    supabase
      .from("finance_applications")
      .select("id", { count: "exact", head: true }),
    supabase
      .from("contact_enquiries")
      .select("created_at")
      .order("created_at", { ascending: true })
      .limit(1),
    supabase
      .from("service_records")
      .select("id", { count: "exact", head: true }),
  ]);

  return {
    vehicles: v.count ?? 0,
    customers: c.count ?? 0,
    enquiriesAllTime:
      (contact.count ?? 0) +
      (vehicleE.count ?? 0) +
      (sell.count ?? 0) +
      (finance.count ?? 0),
    oldestEnquiry: enqOldest.data?.[0]?.created_at ?? null,
    serviceRecords: sr.count ?? 0,
    buildSha: process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) ?? "local",
    buildTime: process.env.VERCEL_BUILD_TIME ?? new Date().toISOString(),
  };
}

export default async function PerformancePage() {
  const h = await loadHealth();

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/admin/insights"
          className="text-sm text-silver-dark hover:text-accent"
        >
          ← Back to insights
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-navy">Website Performance</h1>
        <p className="mt-1 text-sm text-silver-dark">
          Real Web Vitals data lives in Vercel Analytics. Site health and
          deployment info is below.
        </p>
      </div>

      <div className="rounded-xl border border-accent/30 bg-accent/5 p-5">
        <h2 className="text-sm font-semibold text-navy">Web Vitals & traffic</h2>
        <p className="mt-1 text-sm text-silver-dark">
          Real performance data (Largest Contentful Paint, Cumulative Layout Shift,
          First Input Delay, page views, top pages, referrers, devices) is
          collected by Vercel Analytics on every page load and exposed in your
          Vercel dashboard.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <a
            href="https://vercel.com/xinghuang123/ideal-cars/analytics"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center rounded-md bg-accent px-4 py-2 text-sm font-medium text-navy hover:bg-accent-dark"
          >
            Open Vercel Analytics ↗
          </a>
          <a
            href="https://vercel.com/xinghuang123/ideal-cars/speed-insights"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center rounded-md border border-accent px-4 py-2 text-sm font-medium text-accent hover:bg-accent hover:text-navy"
          >
            Open Speed Insights ↗
          </a>
        </div>
      </div>

      <div className="rounded-xl border border-silver bg-white p-5">
        <h2 className="mb-3 text-sm font-semibold text-navy">Site health</h2>
        <dl className="grid grid-cols-2 gap-y-3 text-sm">
          <Item label="Vehicles in inventory" value={h.vehicles.toLocaleString("en-NZ")} />
          <Item label="Customer accounts" value={h.customers.toLocaleString("en-NZ")} />
          <Item label="Total enquiries" value={h.enquiriesAllTime.toLocaleString("en-NZ")} />
          <Item label="Service records logged" value={h.serviceRecords.toLocaleString("en-NZ")} />
          <Item
            label="First enquiry"
            value={
              h.oldestEnquiry
                ? new Date(h.oldestEnquiry).toLocaleDateString("en-NZ")
                : "—"
            }
          />
          <Item label="Build" value={h.buildSha} />
        </dl>
      </div>

      <div className="rounded-xl border border-silver bg-white p-5">
        <h2 className="mb-2 text-sm font-semibold text-navy">Scheduled jobs</h2>
        <p className="text-sm text-silver-dark">
          Service / WoF / rego reminders run daily at 09:00 NZST via Vercel Cron.
          Status and run history:
        </p>
        <a
          href="https://vercel.com/xinghuang123/ideal-cars/cron-jobs"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 inline-flex items-center text-sm font-medium text-accent hover:underline"
        >
          Open Cron Jobs dashboard ↗
        </a>
      </div>
    </div>
  );
}

function Item({ label, value }: { label: string; value: string }) {
  return (
    <>
      <dt className="text-silver-dark">{label}</dt>
      <dd className="text-right font-semibold text-navy">{value}</dd>
    </>
  );
}
