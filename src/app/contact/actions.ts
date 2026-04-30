"use server";

import { createClient } from "@/lib/supabase/server";
import { notifyAdmins, renderContactEnquiryEmail } from "@/lib/email";
import type { EnquirySubject } from "@/types/database";

interface SubmitArgs {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
}

export async function submitContactEnquiry(args: SubmitArgs) {
  const supabase = createClient();
  const { error } = await supabase.from("contact_enquiries").insert({
    name: args.name,
    email: args.email,
    phone: args.phone,
    subject: args.subject as EnquirySubject,
    message: args.message,
  });

  if (error) {
    return { error: "Sorry, we could not send your message. Please try again or call us directly." };
  }

  // Fire notification but never block the response on email send
  notifyAdmins({
    subject: `New contact enquiry: ${args.subject}`,
    html: renderContactEnquiryEmail(args),
    replyTo: args.email,
  }).catch((err) => console.error("[contact] notifyAdmins error:", err));

  return { ok: true };
}
