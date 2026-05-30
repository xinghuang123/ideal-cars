"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { sendEnquiryReply, renderEnquiryReplyEmail } from "@/lib/email";

type ReplyTable =
  | "contact_enquiries"
  | "sell_car_enquiries"
  | "vehicle_enquiries";

interface ReplyInput {
  table: ReplyTable;
  id: string;
  to: string;
  customerName: string | null;
  subject: string;
  message: string;
}

const PATHS: Record<ReplyTable, string> = {
  contact_enquiries: "/admin/contact",
  sell_car_enquiries: "/admin/sell-requests",
  vehicle_enquiries: "/admin/vehicle-enquiries",
};

export async function replyToEnquiry(
  input: ReplyInput,
): Promise<{ ok?: true; error?: string }> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Your session has expired — please log in again." };
  const role = (user.app_metadata as Record<string, unknown> | undefined)?.role;
  if (role !== "admin") return { error: "Admin only." };

  const to = input.to?.trim();
  const subject = input.subject?.trim();
  const message = input.message?.trim();
  if (!to) return { error: "No customer email on file for this enquiry." };
  if (!subject) return { error: "Please enter a subject." };
  if (!message) return { error: "Please enter a message." };

  const result = await sendEnquiryReply({
    to,
    subject,
    html: renderEnquiryReplyEmail(input.customerName, message),
  });
  if ("error" in result) return { error: result.error };

  // Mark the enquiry as replied (best-effort — don't fail the send if this does).
  const { error: statusErr } = await supabase
    .from(input.table)
    .update({ status: "replied" })
    .eq("id", input.id);
  if (statusErr) {
    console.error("[reply] failed to mark replied:", statusErr.message);
  }

  revalidatePath(PATHS[input.table]);
  return { ok: true };
}
