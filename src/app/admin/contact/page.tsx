import { createClient } from "@/lib/supabase/server";
import StatusBadge from "@/components/admin/StatusBadge";
import StatusActions from "@/components/admin/StatusActions";
import ReplyForm from "@/components/admin/ReplyForm";
import type { EnquiryStatus, EnquirySubject } from "@/types/database";

interface ContactEnquiryRow {
  id: string;
  name: string;
  email: string;
  phone: string;
  subject: EnquirySubject;
  message: string;
  status: EnquiryStatus;
  created_at: string;
}

export default async function ContactEnquiriesPage() {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("contact_enquiries")
    .select("*")
    .order("created_at", { ascending: false });

  const enquiries = (data ?? []) as ContactEnquiryRow[];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-navy">Contact Enquiries</h1>
        <p className="mt-1 text-sm text-silver-dark">
          {enquiries.length} total · {enquiries.filter((e) => e.status === "new").length} new
        </p>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          Failed to load: {error.message}
        </div>
      )}

      {enquiries.length === 0 ? (
        <div className="rounded-xl border border-silver bg-white p-12 text-center text-silver-dark">
          No enquiries yet.
        </div>
      ) : (
        <ul className="space-y-3">
          {enquiries.map((e) => (
            <li
              key={e.id}
              className="rounded-xl border border-silver bg-white p-5 shadow-sm"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold text-navy">{e.name}</span>
                    <StatusBadge status={e.status} />
                    <span className="text-xs text-silver-dark">{e.subject}</span>
                  </div>
                  <p className="mt-1 text-sm text-silver-dark">
                    <a
                      href={`mailto:${e.email}?subject=Re: ${e.subject} - Ideal Cars`}
                      className="text-accent hover:underline"
                    >
                      {e.email}
                    </a>
                    {" · "}
                    <a
                      href={`tel:${e.phone}`}
                      className="text-accent hover:underline"
                    >
                      {e.phone}
                    </a>
                  </p>
                </div>
                <span className="whitespace-nowrap text-xs text-silver-dark">
                  {new Date(e.created_at).toLocaleString("en-NZ")}
                </span>
              </div>

              <p className="mt-3 whitespace-pre-wrap rounded-lg bg-gray-50 p-3 text-sm text-navy">
                {e.message}
              </p>

              <div className="mt-3">
                <StatusActions table="contact_enquiries" id={e.id} status={e.status} />
              </div>

              <div className="mt-3">
                <ReplyForm
                  table="contact_enquiries"
                  id={e.id}
                  to={e.email}
                  customerName={e.name}
                  defaultSubject={`Re: ${e.subject} - Ideal Cars`}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
