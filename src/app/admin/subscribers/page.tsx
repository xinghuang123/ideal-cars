import { createClient } from "@/lib/supabase/server";
import SubscriberToggle from "@/components/admin/SubscriberToggle";

interface SubscriberRow {
  id: string;
  email: string;
  is_active: boolean;
  subscribed_at: string;
  unsubscribed_at: string | null;
}

export default async function SubscribersPage() {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("newsletter_subscribers")
    .select("*")
    .order("subscribed_at", { ascending: false });

  const subscribers = (data ?? []) as SubscriberRow[];
  const activeCount = subscribers.filter((s) => s.is_active).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-navy">Newsletter Subscribers</h1>
        <p className="mt-1 text-sm text-silver-dark">
          {subscribers.length} total · {activeCount} active
        </p>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          Failed to load: {error.message}
        </div>
      )}

      {subscribers.length === 0 ? (
        <div className="rounded-xl border border-silver bg-white p-12 text-center text-silver-dark">
          No subscribers yet.
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-silver bg-white shadow-sm">
          <table className="w-full divide-y divide-silver">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-silver-dark">
                  Email
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-silver-dark">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-silver-dark">
                  Subscribed
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-silver-dark">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-silver">
              {subscribers.map((s) => (
                <tr key={s.id}>
                  <td className="px-4 py-3 text-sm text-navy">
                    <a
                      href={`mailto:${s.email}`}
                      className="hover:text-accent hover:underline"
                    >
                      {s.email}
                    </a>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium uppercase ${
                        s.is_active
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {s.is_active ? "Active" : "Unsubscribed"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-silver-dark">
                    {new Date(s.subscribed_at).toLocaleDateString("en-NZ")}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <SubscriberToggle id={s.id} isActive={s.is_active} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
