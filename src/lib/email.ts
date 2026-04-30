import { Resend } from "resend";
import { createAdminClient } from "@/lib/supabase/admin";

const FROM_EMAIL =
  process.env.EMAIL_FROM ?? "Ideal Cars <noreply@idealcarsltd.co.nz>";

function getResend() {
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  return new Resend(key);
}

async function getAdminEmails(): Promise<string[]> {
  try {
    const admin = createAdminClient();
    const { data, error } = await admin.auth.admin.listUsers({
      page: 1,
      perPage: 200,
    });
    if (error) return [];
    return data.users
      .filter((u) => {
        const role = (u.app_metadata as Record<string, unknown> | undefined)
          ?.role;
        return role === "admin" && !!u.email;
      })
      .map((u) => u.email!);
  } catch {
    return [];
  }
}

interface SendArgs {
  subject: string;
  html: string;
  replyTo?: string;
}

/**
 * Sends an email to all admin users. No-op (with console warning) if
 * Resend is not configured. Failures are swallowed so they never break
 * the user-facing submission flow.
 */
export async function notifyAdmins({ subject, html, replyTo }: SendArgs) {
  const resend = getResend();
  if (!resend) {
    console.warn("[email] RESEND_API_KEY not set — skipping admin notification");
    return;
  }

  const recipients = await getAdminEmails();
  if (recipients.length === 0) {
    console.warn("[email] No admin users found — skipping notification");
    return;
  }

  try {
    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: recipients,
      subject,
      html,
      replyTo,
    });
    if (error) {
      console.error("[email] notifyAdmins failed:", error);
    }
  } catch (err) {
    console.error("[email] notifyAdmins threw:", err);
  }
}

export function escapeHtml(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

interface ContactEnquiry {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
}

export function renderContactEnquiryEmail(e: ContactEnquiry): string {
  const safe = {
    name: escapeHtml(e.name),
    email: escapeHtml(e.email),
    phone: escapeHtml(e.phone),
    subject: escapeHtml(e.subject),
    message: escapeHtml(e.message).replace(/\n/g, "<br/>"),
  };
  return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #1E2A3A; border-bottom: 2px solid #5BC0EB; padding-bottom: 8px;">
        New Contact Enquiry
      </h2>
      <table style="width: 100%; border-collapse: collapse; margin-top: 16px;">
        <tr><td style="padding: 8px 0; color: #5b6570; width: 110px;">From</td><td style="padding: 8px 0;"><strong>${safe.name}</strong></td></tr>
        <tr><td style="padding: 8px 0; color: #5b6570;">Email</td><td style="padding: 8px 0;"><a href="mailto:${safe.email}">${safe.email}</a></td></tr>
        <tr><td style="padding: 8px 0; color: #5b6570;">Phone</td><td style="padding: 8px 0;"><a href="tel:${safe.phone}">${safe.phone}</a></td></tr>
        <tr><td style="padding: 8px 0; color: #5b6570;">Subject</td><td style="padding: 8px 0;">${safe.subject}</td></tr>
      </table>
      <div style="margin-top: 16px; padding: 16px; background: #f8f9fa; border-left: 3px solid #5BC0EB; border-radius: 4px;">
        ${safe.message}
      </div>
      <p style="margin-top: 24px; font-size: 12px; color: #5b6570;">
        Reply directly to this email to respond, or open the admin panel to mark as replied.
      </p>
    </div>
  `;
}

interface SellCarEnquiry {
  name: string;
  email: string;
  phone: string;
  make: string;
  model: string;
  year: number;
  mileage: number;
  fuelType: string;
  transmission: string;
  condition: string;
  description: string | null;
  expectedPrice: number | null;
}

export function renderSellCarEnquiryEmail(e: SellCarEnquiry): string {
  const safe = {
    name: escapeHtml(e.name),
    email: escapeHtml(e.email),
    phone: escapeHtml(e.phone),
    make: escapeHtml(e.make),
    model: escapeHtml(e.model),
    fuelType: escapeHtml(e.fuelType),
    transmission: escapeHtml(e.transmission),
    condition: escapeHtml(e.condition),
    description: e.description ? escapeHtml(e.description).replace(/\n/g, "<br/>") : "",
  };
  const priceLine = e.expectedPrice
    ? `$${e.expectedPrice.toLocaleString("en-NZ")} NZD`
    : "Not provided";
  const mileage = `${e.mileage.toLocaleString("en-NZ")} km`;
  return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #1E2A3A; border-bottom: 2px solid #5BC0EB; padding-bottom: 8px;">
        New Sell Car Request
      </h2>
      <h3 style="color: #1E2A3A; margin-top: 16px;">
        ${e.year} ${safe.make} ${safe.model}
      </h3>
      <table style="width: 100%; border-collapse: collapse;">
        <tr><td style="padding: 8px 0; color: #5b6570; width: 140px;">From</td><td style="padding: 8px 0;"><strong>${safe.name}</strong></td></tr>
        <tr><td style="padding: 8px 0; color: #5b6570;">Email</td><td style="padding: 8px 0;"><a href="mailto:${safe.email}">${safe.email}</a></td></tr>
        <tr><td style="padding: 8px 0; color: #5b6570;">Phone</td><td style="padding: 8px 0;"><a href="tel:${safe.phone}">${safe.phone}</a></td></tr>
        <tr><td style="padding: 8px 0; color: #5b6570;">Mileage</td><td style="padding: 8px 0;">${mileage}</td></tr>
        <tr><td style="padding: 8px 0; color: #5b6570;">Fuel</td><td style="padding: 8px 0;">${safe.fuelType}</td></tr>
        <tr><td style="padding: 8px 0; color: #5b6570;">Transmission</td><td style="padding: 8px 0;">${safe.transmission}</td></tr>
        <tr><td style="padding: 8px 0; color: #5b6570;">Condition</td><td style="padding: 8px 0;">${safe.condition}</td></tr>
        <tr><td style="padding: 8px 0; color: #5b6570;">Expected price</td><td style="padding: 8px 0;">${priceLine}</td></tr>
      </table>
      ${
        safe.description
          ? `<div style="margin-top: 16px; padding: 16px; background: #f8f9fa; border-left: 3px solid #5BC0EB; border-radius: 4px;">${safe.description}</div>`
          : ""
      }
      <p style="margin-top: 24px; font-size: 12px; color: #5b6570;">
        Open the admin panel to mark this request as actioned.
      </p>
    </div>
  `;
}
