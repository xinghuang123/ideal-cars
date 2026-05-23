"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

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

  // Send the recovery email so the new admin can set their password.
  // generateLink auto-sends via Supabase's configured SMTP.
  const { error: linkError } = await admin.auth.admin.generateLink({
    type: "recovery",
    email,
    options: { redirectTo: `${siteUrl()}/admin/set-password` },
  });

  if (linkError) {
    return {
      error: `Admin created but invite email failed: ${linkError.message}`,
    };
  }

  revalidatePath("/admin/admins");
  return { ok: true, email };
}

async function sendRecoveryEmail(email: string) {
  const admin = createAdminClient();
  const { error } = await admin.auth.admin.generateLink({
    type: "recovery",
    email,
    options: { redirectTo: `${siteUrl()}/admin/set-password` },
  });
  if (error) {
    return { error: error.message };
  }
  revalidatePath("/admin/admins");
  return { ok: true };
}

export async function resendInvite(userId: string, email: string) {
  await requireAdmin();
  return sendRecoveryEmail(email);
}

export async function sendPasswordRecovery(email: string) {
  await requireAdmin();
  return sendRecoveryEmail(email);
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
  if (error) {
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
  if (error) {
    return { error: error.message };
  }
  revalidatePath("/admin/admins");
  return { ok: true };
}
