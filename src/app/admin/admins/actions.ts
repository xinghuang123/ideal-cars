"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  renderAdminInviteEmail,
  renderAdminPasswordResetEmail,
  sendTransactionalEmail,
} from "@/lib/email";

function siteUrl() {
  return (
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://idealcarsltd.co.nz"
  ).replace(/\/$/, "");
}

async function requireAdmin() {
  const supabase = createClient();
  const { data } = await supabase.auth.getUser();
  const role =
    (data.user?.app_metadata as Record<string, unknown> | undefined)?.role;
  if (role !== "admin") {
    throw new Error("Forbidden");
  }
  return data.user!;
}

export async function inviteAdmin(formData: FormData) {
  await requireAdmin();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  if (!email) {
    return { error: "Email is required." };
  }

  const admin = createAdminClient();

  // Atomically create the user with admin role baked into app_metadata.
  // email_confirm: true skips the signup-confirmation step — we use the
  // recovery flow below to let the new admin set their password.
  const { data: createData, error: createError } =
    await admin.auth.admin.createUser({
      email,
      email_confirm: true,
      app_metadata: { role: "admin" },
    });

  if (createError || !createData?.user) {
    return { error: createError?.message ?? "Failed to create user." };
  }

  // Generate a recovery link so the new admin can set their password,
  // then send it via Resend (Supabase's built-in SMTP isn't reliable on
  // this project).
  const { data: linkData, error: linkError } =
    await admin.auth.admin.generateLink({
      type: "recovery",
      email,
      options: { redirectTo: `${siteUrl()}/admin/set-password` },
    });

  const tokenHash = linkData?.properties?.hashed_token;
  if (linkError || !tokenHash) {
    await admin.auth.admin.deleteUser(createData.user.id);
    return {
      error: `Failed to generate invite link: ${linkError?.message ?? "no link returned"}`,
    };
  }

  // Route through our own /auth/confirm so verifyOtp happens server-side
  // and the session cookie is set before the user lands on the form.
  // (Supabase's default action_link uses PKCE, which fails for
  // server-initiated flows because the code verifier isn't on the client.)
  const confirmLink = `${siteUrl()}/auth/confirm?token_hash=${encodeURIComponent(
    tokenHash,
  )}&type=recovery&next=${encodeURIComponent("/admin/set-password")}`;

  const emailResult = await sendTransactionalEmail({
    to: email,
    subject: "You've been invited to Ideal Cars admin",
    html: renderAdminInviteEmail(confirmLink),
  });

  if ("error" in emailResult) {
    await admin.auth.admin.deleteUser(createData.user.id);
    return { error: `Invite email failed: ${emailResult.error}` };
  }

  revalidatePath("/admin/admins");
  return { ok: true, email };
}

async function sendRecoveryEmail(
  email: string,
  kind: "invite" | "reset",
) {
  const admin = createAdminClient();
  const { data, error } = await admin.auth.admin.generateLink({
    type: "recovery",
    email,
    options: { redirectTo: `${siteUrl()}/admin/set-password` },
  });
  const tokenHash = data?.properties?.hashed_token;
  if (error || !tokenHash) {
    return {
      error: `Failed to generate link: ${error?.message ?? "no link returned"}`,
    };
  }
  const confirmLink = `${siteUrl()}/auth/confirm?token_hash=${encodeURIComponent(
    tokenHash,
  )}&type=recovery&next=${encodeURIComponent("/admin/set-password")}`;
  const emailResult = await sendTransactionalEmail({
    to: email,
    subject:
      kind === "invite"
        ? "You've been invited to Ideal Cars admin"
        : "Reset your Ideal Cars admin password",
    html:
      kind === "invite"
        ? renderAdminInviteEmail(confirmLink)
        : renderAdminPasswordResetEmail(confirmLink),
  });
  if ("error" in emailResult) {
    return { error: `Email failed: ${emailResult.error}` };
  }
  revalidatePath("/admin/admins");
  return { ok: true };
}

export async function resendInvite(userId: string, email: string) {
  await requireAdmin();
  return sendRecoveryEmail(email, "invite");
}

export async function sendPasswordRecovery(email: string) {
  await requireAdmin();
  return sendRecoveryEmail(email, "reset");
}

function isUserGoneError(message: string | undefined) {
  if (!message) return false;
  return /not.?found|does not exist|no rows|user_not_found/i.test(message);
}

export async function revokeAdmin(userId: string) {
  const me = await requireAdmin();
  if (me.id === userId) {
    return { error: "You cannot revoke your own admin access." };
  }
  const admin = createAdminClient();
  const { error } = await admin.auth.admin.updateUserById(userId, {
    app_metadata: { role: null },
  });
  if (error && !isUserGoneError(error.message)) {
    return { error: error.message };
  }
  revalidatePath("/admin/admins");
  return { ok: true };
}

export async function deleteAdminUser(userId: string) {
  const me = await requireAdmin();
  if (me.id === userId) {
    return { error: "You cannot delete your own account." };
  }
  const admin = createAdminClient();
  const { error } = await admin.auth.admin.deleteUser(userId);
  if (error && !isUserGoneError(error.message)) {
    return { error: error.message };
  }
  revalidatePath("/admin/admins");
  return { ok: true };
}
