"use server";

import { createClient } from "@/lib/supabase/server";
import {
  notifyAdmins,
  emailCustomer,
  renderContactEnquiryEmail,
  renderCustomerContactConfirmation,
} from "@/lib/email";
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

  // Fire notification + customer confirmation in parallel; never block on email
  Promise.allSettled([
    notifyAdmins({
      subject: `New contact enquiry: ${args.subject}`,
      html: renderContactEnquiryEmail(args),
      replyTo: args.email,
    }),
    emailCustomer({
      to: args.email,
      subject: "We've received your enquiry — Ideal Cars",
      html: renderCustomerContactConfirmation(args.name),
    }),
  ]).catch((err) => console.error("[contact] email error:", err));

  return { ok: true };
}
