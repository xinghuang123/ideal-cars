import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  emailCustomer,
  renderServiceReminderEmail,
  renderWofReminderEmail,
  renderRegoReminderEmail,
} from "@/lib/email";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Send reminders this many days before each due date.
const REMINDER_WINDOWS = [30, 14, 7, 1, 0];

interface VehicleRow {
  id: string;
  customer_id: string;
  year: number;
  make: string;
  model: string;
  next_service_due_date: string | null;
  next_wof_due_date: string | null;
  rego_expiry_date: string | null;
}

interface ReminderJob {
  vehicle: VehicleRow;
  type: "service" | "wof" | "rego";
  dueDate: string;
  daysUntil: number;
}

function dayDiff(dueIso: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(dueIso);
  due.setHours(0, 0, 0, 0);
  return Math.round((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

function shouldRemind(daysUntil: number): boolean {
  return REMINDER_WINDOWS.includes(daysUntil);
}

export async function GET(request: NextRequest) {
  // Vercel Cron sends an Authorization: Bearer <CRON_SECRET> header.
  const expected = process.env.CRON_SECRET;
  if (expected) {
    const auth = request.headers.get("authorization");
    if (auth !== `Bearer ${expected}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const admin = createAdminClient();

  const { data: vehicles, error } = await admin
    .from("customer_vehicles")
    .select(
      "id, customer_id, year, make, model, next_service_due_date, next_wof_due_date, rego_expiry_date",
    )
    .or(
      "next_service_due_date.not.is.null,next_wof_due_date.not.is.null,rego_expiry_date.not.is.null",
    );

  if (error) {
    console.error("[cron] failed to load customer_vehicles", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const jobs: ReminderJob[] = [];
  for (const v of (vehicles ?? []) as VehicleRow[]) {
    if (v.next_service_due_date) {
      const d = dayDiff(v.next_service_due_date);
      if (shouldRemind(d))
        jobs.push({ vehicle: v, type: "service", dueDate: v.next_service_due_date, daysUntil: d });
    }
    if (v.next_wof_due_date) {
      const d = dayDiff(v.next_wof_due_date);
      if (shouldRemind(d))
        jobs.push({ vehicle: v, type: "wof", dueDate: v.next_wof_due_date, daysUntil: d });
    }
    if (v.rego_expiry_date) {
      const d = dayDiff(v.rego_expiry_date);
      if (shouldRemind(d))
        jobs.push({ vehicle: v, type: "rego", dueDate: v.rego_expiry_date, daysUntil: d });
    }
  }

  if (jobs.length === 0) {
    return NextResponse.json({ ok: true, sent: 0, jobs: 0 });
  }

  // Look up emails + names. Fetch customer profiles in one batch.
  const customerIds = Array.from(new Set(jobs.map((j) => j.vehicle.customer_id)));
  const profiles: Record<string, { email: string; fullName: string | null }> = {};
  for (const id of customerIds) {
    try {
      const { data } = await admin.auth.admin.getUserById(id);
      if (!data.user?.email) continue;
      const meta = data.user.user_metadata as Record<string, unknown> | undefined;
      profiles[id] = {
        email: data.user.email,
        fullName: (meta?.full_name as string | null) ?? null,
      };
    } catch {
      /* skip */
    }
  }
  const { data: profileRows } = await admin
    .from("customer_profiles")
    .select("id, full_name")
    .in("id", customerIds);
  for (const p of profileRows ?? []) {
    if (profiles[p.id]) profiles[p.id].fullName = p.full_name ?? profiles[p.id].fullName;
  }

  let sent = 0;
  for (const j of jobs) {
    const profile = profiles[j.vehicle.customer_id];
    if (!profile?.email) continue;

    const args = {
      fullName: profile.fullName,
      vehicle: { year: j.vehicle.year, make: j.vehicle.make, model: j.vehicle.model },
      dueDate: j.dueDate,
      daysUntil: j.daysUntil,
    };

    let subject = "";
    let html = "";
    if (j.type === "service") {
      subject = "Service reminder — Ideal Cars";
      html = renderServiceReminderEmail(args);
    } else if (j.type === "wof") {
      subject = "WoF reminder — Ideal Cars";
      html = renderWofReminderEmail(args);
    } else {
      subject = "Rego reminder — Ideal Cars";
      html = renderRegoReminderEmail(args);
    }

    await emailCustomer({ to: profile.email, subject, html });
    sent++;
  }

  return NextResponse.json({ ok: true, jobs: jobs.length, sent });
}
