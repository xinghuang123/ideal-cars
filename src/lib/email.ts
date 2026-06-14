import { Resend } from "resend";
import { createAdminClient } from "@/lib/supabase/admin";

const FROM_EMAIL =
  process.env.EMAIL_FROM ?? "Ideal Cars <noreply@idealcarsltd.co.nz>";

// From address for emails the customer is meant to reply to (e.g. an admin's
// reply to an enquiry). Uses a non-"noreply" mailbox on the verified domain so
// the visible sender doesn't contradict the "reply to this email" wording.
// Replies still route to EMAIL_REPLY_TO via the Reply-To header.
const REPLY_FROM_EMAIL =
  process.env.EMAIL_REPLY_FROM ?? "Ideal Cars <enquiries@idealcarsltd.co.nz>";

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

interface CustomerEmailArgs {
  to: string;
  subject: string;
  html: string;
}

/**
 * Sends a confirmation email back to the customer. Same fail-safe
 * behavior as notifyAdmins.
 */
export async function emailCustomer({ to, subject, html }: CustomerEmailArgs) {
  const resend = getResend();
  if (!resend) return;
  try {
    const { error } = await resend.emails.send({
      from: REPLY_FROM_EMAIL,
      to,
      subject,
      html,
      replyTo: process.env.EMAIL_REPLY_TO ?? "idealcarsnzltd@gmail.com",
    });
    if (error) console.error("[email] emailCustomer failed:", error);
  } catch (err) {
    console.error("[email] emailCustomer threw:", err);
  }
}

/**
 * Sends an email and reports the outcome so callers (like the admin
 * invite flow) can surface failures back to the user.
 */
export async function sendTransactionalEmail(args: {
  to: string;
  subject: string;
  html: string;
}): Promise<{ ok: true } | { error: string }> {
  const resend = getResend();
  if (!resend) {
    return { error: "Email service not configured (RESEND_API_KEY missing)" };
  }
  try {
    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: args.to,
      subject: args.subject,
      html: args.html,
    });
    if (error) {
      console.error("[email] sendTransactionalEmail failed:", error);
      return { error: error.message };
    }
    return { ok: true };
  } catch (err) {
    console.error("[email] sendTransactionalEmail threw:", err);
    return {
      error: err instanceof Error ? err.message : "Email failed to send",
    };
  }
}

/**
 * Sends an admin's reply to a customer enquiry. From the branded site
 * address, with reply-to set to the dealership inbox so any further
 * back-and-forth lands in a real mailbox. Reports the outcome.
 */
export async function sendEnquiryReply(args: {
  to: string;
  subject: string;
  html: string;
}): Promise<{ ok: true } | { error: string }> {
  const resend = getResend();
  if (!resend) {
    return { error: "Email service not configured (RESEND_API_KEY missing)" };
  }
  try {
    const { error } = await resend.emails.send({
      from: REPLY_FROM_EMAIL,
      to: args.to,
      subject: args.subject,
      html: args.html,
      replyTo: process.env.EMAIL_REPLY_TO ?? "idealcarsnzltd@gmail.com",
    });
    if (error) {
      console.error("[email] sendEnquiryReply failed:", error);
      return { error: error.message };
    }
    return { ok: true };
  } catch (err) {
    console.error("[email] sendEnquiryReply threw:", err);
    return {
      error: err instanceof Error ? err.message : "Email failed to send",
    };
  }
}

/** Branded wrapper for an admin's free-text reply to an enquiry. */
export function renderEnquiryReplyEmail(
  customerName: string | null,
  message: string,
): string {
  const safeName = customerName ? escapeHtml(customerName.split(" ")[0]) : "there";
  const safeBody = escapeHtml(message).replace(/\n/g, "<br/>");
  return emailShell(
    "A reply from Ideal Cars",
    `
      <p>Kia ora ${safeName},</p>
      <div style="margin-top: 8px;">${safeBody}</div>
      <p style="margin-top: 24px;">Cheers,<br/>The Ideal Cars team</p>
      <p style="font-size: 12px; color: #5b6570; margin-top: 16px;">
        You can reply directly to this email to continue the conversation.
      </p>
    `,
  );
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

function emailShell(title: string, body: string): string {
  const siteUrl = (
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://idealcarsltd.co.nz"
  ).replace(/\/$/, "");
  const logoUrl = `${siteUrl}/images/logo-transparent.png`;
  return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; color: #1E2A3A;">
      <div style="background: #1E2A3A; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
        <img src="${logoUrl}" alt="Ideal Cars" width="180" style="display: inline-block; max-width: 180px; height: auto;" />
      </div>
      <div style="background: white; padding: 28px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
        <h2 style="color: #1E2A3A; margin-top: 0;">${title}</h2>
        ${body}
      </div>
      <div style="text-align: center; padding: 16px; color: #5b6570; font-size: 12px;">
        Ideal Cars Ltd · 020 4190 7335 · idealcarsnzltd@gmail.com
      </div>
    </div>
  `;
}

export function renderCustomerContactConfirmation(name: string): string {
  const safe = escapeHtml(name);
  return emailShell(
    "Thanks for getting in touch",
    `
      <p>Kia ora ${safe},</p>
      <p>We've received your message and one of our team will be in touch within one business day.</p>
      <p>If your enquiry is urgent, please call us directly on <a href="tel:0204190 7335" style="color: #5BC0EB;">020 4190 7335</a>.</p>
      <p style="margin-top: 24px;">Cheers,<br/>The Ideal Cars team</p>
    `,
  );
}

export function renderCustomerSellConfirmation(
  name: string,
  car: { year: number; make: string; model: string },
): string {
  const safeName = escapeHtml(name);
  const safeMake = escapeHtml(car.make);
  const safeModel = escapeHtml(car.model);
  return emailShell(
    "Valuation request received",
    `
      <p>Kia ora ${safeName},</p>
      <p>Thanks for sending us details on your <strong>${car.year} ${safeMake} ${safeModel}</strong>.</p>
      <p>We'll review the information and come back to you within 24 hours with a valuation. If we need any extra details — such as photos or service history — we'll let you know.</p>
      <p>If you'd like to talk it through sooner, give us a call on <a href="tel:0204190 7335" style="color: #5BC0EB;">020 4190 7335</a>.</p>
      <p style="margin-top: 24px;">Cheers,<br/>The Ideal Cars team</p>
    `,
  );
}

interface VehicleEnquiry {
  name: string;
  email: string;
  phone: string;
  message: string | null;
  vehicle: {
    year: number;
    make: string;
    model: string;
    stockNumber: string;
    price: number;
    url: string;
  };
}

export function renderVehicleEnquiryEmail(e: VehicleEnquiry): string {
  const safe = {
    name: escapeHtml(e.name),
    email: escapeHtml(e.email),
    phone: escapeHtml(e.phone),
    make: escapeHtml(e.vehicle.make),
    model: escapeHtml(e.vehicle.model),
    stock: escapeHtml(e.vehicle.stockNumber),
    message: e.message ? escapeHtml(e.message).replace(/\n/g, "<br/>") : "",
    url: escapeHtml(e.vehicle.url),
  };
  return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #1E2A3A; border-bottom: 2px solid #5BC0EB; padding-bottom: 8px;">
        New Vehicle Enquiry
      </h2>
      <h3 style="color: #1E2A3A;">
        <a href="${safe.url}" style="color: #1E2A3A;">${e.vehicle.year} ${safe.make} ${safe.model}</a>
        — Stock #${safe.stock}
      </h3>
      <p style="color: #5b6570;">Listed at $${e.vehicle.price.toLocaleString("en-NZ")}</p>
      <table style="width: 100%; border-collapse: collapse; margin-top: 16px;">
        <tr><td style="padding: 8px 0; color: #5b6570; width: 110px;">From</td><td style="padding: 8px 0;"><strong>${safe.name}</strong></td></tr>
        <tr><td style="padding: 8px 0; color: #5b6570;">Email</td><td style="padding: 8px 0;"><a href="mailto:${safe.email}">${safe.email}</a></td></tr>
        <tr><td style="padding: 8px 0; color: #5b6570;">Phone</td><td style="padding: 8px 0;"><a href="tel:${safe.phone}">${safe.phone}</a></td></tr>
      </table>
      ${
        safe.message
          ? `<div style="margin-top: 16px; padding: 16px; background: #f8f9fa; border-left: 3px solid #5BC0EB; border-radius: 4px;">${safe.message}</div>`
          : `<p style="color: #5b6570; margin-top: 16px;"><em>No message — customer just left contact details.</em></p>`
      }
    </div>
  `;
}

interface ReminderArgs {
  fullName: string | null;
  vehicle: { year: number; make: string; model: string };
  dueDate: string;
  daysUntil: number;
}

function reminderShell(
  title: string,
  intro: string,
  vehicle: { year: number; make: string; model: string },
  dueDate: string,
  daysUntil: number,
  cta: string,
): string {
  const safeMake = escapeHtml(vehicle.make);
  const safeModel = escapeHtml(vehicle.model);
  const niceDate = new Date(dueDate).toLocaleDateString("en-NZ", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const urgency =
    daysUntil <= 0
      ? `<strong style="color: #b91c1c;">overdue</strong>`
      : daysUntil <= 7
        ? `<strong style="color: #b45309;">due in ${daysUntil} day${daysUntil === 1 ? "" : "s"}</strong>`
        : `due in ${daysUntil} days`;
  return emailShell(
    title,
    `
      <p>${intro}</p>
      <div style="margin: 16px 0; padding: 16px; background: #f8f9fa; border-left: 3px solid #5BC0EB; border-radius: 4px;">
        <p style="margin: 0; font-weight: 600;">${vehicle.year} ${safeMake} ${safeModel}</p>
        <p style="margin: 4px 0 0; color: #5b6570;">${cta} ${niceDate} (${urgency}).</p>
      </div>
      <p>Reply to this email or call us on <a href="tel:0204190 7335" style="color: #5BC0EB;">020 4190 7335</a> to book in.</p>
      <p style="margin-top: 24px;">Cheers,<br/>The Ideal Cars team</p>
    `,
  );
}

export function renderServiceReminderEmail(args: ReminderArgs): string {
  const safe = args.fullName ? escapeHtml(args.fullName.split(" ")[0]) : "there";
  return reminderShell(
    "Service reminder",
    `Kia ora ${safe},`,
    args.vehicle,
    args.dueDate,
    args.daysUntil,
    "Your next service is",
  );
}

export function renderWofReminderEmail(args: ReminderArgs): string {
  const safe = args.fullName ? escapeHtml(args.fullName.split(" ")[0]) : "there";
  return reminderShell(
    "WoF reminder",
    `Kia ora ${safe},`,
    args.vehicle,
    args.dueDate,
    args.daysUntil,
    "The Warrant of Fitness expires",
  );
}

export function renderRegoReminderEmail(args: ReminderArgs): string {
  const safe = args.fullName ? escapeHtml(args.fullName.split(" ")[0]) : "there";
  return reminderShell(
    "Rego reminder",
    `Kia ora ${safe},`,
    args.vehicle,
    args.dueDate,
    args.daysUntil,
    "Vehicle registration expires",
  );
}

export function renderAdminInviteEmail(actionLink: string): string {
  return emailShell(
    "You've been invited as an admin",
    `
      <p>Kia ora,</p>
      <p>You've been invited to join the Ideal Cars admin team. Click the button below to set your password and access the admin panel.</p>
      <p style="margin: 24px 0;">
        <a href="${actionLink}" style="display: inline-block; background: #5BC0EB; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600;">Set your password</a>
      </p>
      <p style="font-size: 12px; color: #5b6570;">If the button doesn't work, copy and paste this link into your browser:<br/>
      <a href="${actionLink}" style="color: #5BC0EB; word-break: break-all;">${actionLink}</a></p>
      <p style="margin-top: 24px;">Cheers,<br/>The Ideal Cars team</p>
    `,
  );
}

export function renderAdminPasswordResetEmail(actionLink: string): string {
  return emailShell(
    "Reset your admin password",
    `
      <p>Kia ora,</p>
      <p>We received a request to reset your password for the Ideal Cars admin panel. Click the button below to set a new password.</p>
      <p style="margin: 24px 0;">
        <a href="${actionLink}" style="display: inline-block; background: #5BC0EB; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600;">Reset password</a>
      </p>
      <p style="font-size: 12px; color: #5b6570;">If you didn't request this, you can safely ignore this email.</p>
      <p style="font-size: 12px; color: #5b6570;">If the button doesn't work, copy and paste this link into your browser:<br/>
      <a href="${actionLink}" style="color: #5BC0EB; word-break: break-all;">${actionLink}</a></p>
      <p style="margin-top: 24px;">Cheers,<br/>The Ideal Cars team</p>
    `,
  );
}

export function renderNewsletterConfirmEmail(confirmUrl: string): string {
  return emailShell(
    "Confirm your newsletter subscription",
    `
      <p>Kia ora,</p>
      <p>Thanks for signing up to the Ideal Cars newsletter — fresh stock, deals, and car-buying tips, straight to your inbox.</p>
      <p>Please confirm your email address to start receiving updates:</p>
      <p style="margin: 24px 0;">
        <a href="${confirmUrl}" style="display: inline-block; background: #5BC0EB; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600;">Confirm subscription</a>
      </p>
      <p style="font-size: 12px; color: #5b6570;">If the button doesn't work, copy and paste this link into your browser:<br/>
      <a href="${confirmUrl}" style="color: #5BC0EB; word-break: break-all;">${confirmUrl}</a></p>
      <p style="font-size: 12px; color: #5b6570;">If you didn't sign up, you can safely ignore this email — you won't be subscribed.</p>
      <p style="margin-top: 24px;">Cheers,<br/>The Ideal Cars team</p>
    `,
  );
}

export function renderCustomerWelcomeEmail(fullName: string | null): string {
  const safe = fullName ? escapeHtml(fullName) : "there";
  return emailShell(
    "Welcome to Ideal Cars",
    `
      <p>Kia ora ${safe},</p>
      <p>Thanks for creating an Ideal Cars account.</p>
      <p>You can now use your account to:</p>
      <ul style="line-height: 1.7;">
        <li>Track vehicles you've purchased from us — service history all in one place</li>
        <li>Add cars you bought elsewhere so we can service them too</li>
        <li>Review your finance applications and their status</li>
        <li>Get reminders before your WoF, rego, or next service is due</li>
      </ul>
      <p>Sign in any time at <a href="https://idealcarsltd.co.nz/login" style="color: #5BC0EB;">idealcarsltd.co.nz/login</a>.</p>
      <p style="margin-top: 24px;">Cheers,<br/>The Ideal Cars team</p>
    `,
  );
}

export function renderCustomerVehicleEnquiryConfirmation(
  name: string,
  vehicle: { year: number; make: string; model: string },
): string {
  const safeName = escapeHtml(name);
  const safeMake = escapeHtml(vehicle.make);
  const safeModel = escapeHtml(vehicle.model);
  return emailShell(
    "Thanks for your enquiry",
    `
      <p>Kia ora ${safeName},</p>
      <p>We've received your enquiry about the <strong>${vehicle.year} ${safeMake} ${safeModel}</strong> and will be in touch shortly.</p>
      <p>If your enquiry is urgent, please call us on <a href="tel:0204190 7335" style="color: #5BC0EB;">020 4190 7335</a>.</p>
      <p style="margin-top: 24px;">Cheers,<br/>The Ideal Cars team</p>
    `,
  );
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
