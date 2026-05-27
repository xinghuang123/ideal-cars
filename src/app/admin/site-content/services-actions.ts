"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

async function requireAdmin() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { supabase, user: null, error: "Not signed in." as const };
  const role = (user.app_metadata as Record<string, unknown> | undefined)?.role;
  if (role !== "admin") return { supabase, user: null, error: "Admin only." as const };
  return { supabase, user, error: null };
}

export interface ServiceFields {
  title: string;
  description: string;
  icon: string;
  features: string[];
  is_active: boolean;
}

export async function createService(): Promise<{
  ok?: true;
  id?: string;
  error?: string;
}> {
  const { supabase, user, error } = await requireAdmin();
  if (error || !user) return { error: error ?? "Unauthorized" };

  const { data: existing } = await supabase
    .from("services")
    .select("display_order")
    .order("display_order", { ascending: false })
    .limit(1);
  const nextOrder =
    existing && existing.length > 0
      ? (existing[0].display_order as number) + 1
      : 1;

  const { data, error: insertError } = await supabase
    .from("services")
    .insert({
      title: "New Service",
      description: "",
      icon: "wrench",
      features: [],
      display_order: nextOrder,
      is_active: true,
    })
    .select("id")
    .single();

  if (insertError) return { error: insertError.message };
  revalidatePath("/service");
  revalidatePath("/admin/site-content");
  return { ok: true, id: (data as { id: string }).id };
}

export async function updateService(
  id: string,
  fields: ServiceFields,
): Promise<{ ok?: true; error?: string }> {
  const { supabase, user, error } = await requireAdmin();
  if (error || !user) return { error: error ?? "Unauthorized" };

  const { error: updateError } = await supabase
    .from("services")
    .update({
      title: fields.title.trim(),
      description: fields.description.trim(),
      icon: fields.icon.trim() || null,
      features: fields.features.map((f) => f.trim()).filter(Boolean),
      is_active: fields.is_active,
    })
    .eq("id", id);

  if (updateError) return { error: updateError.message };
  revalidatePath("/service");
  revalidatePath("/admin/site-content");
  return { ok: true };
}

export async function deleteService(
  id: string,
): Promise<{ ok?: true; error?: string }> {
  const { supabase, user, error } = await requireAdmin();
  if (error || !user) return { error: error ?? "Unauthorized" };

  const { error: deleteError } = await supabase
    .from("services")
    .delete()
    .eq("id", id);

  if (deleteError) return { error: deleteError.message };
  revalidatePath("/service");
  revalidatePath("/admin/site-content");
  return { ok: true };
}

export async function reorderService(
  id: string,
  direction: "up" | "down",
): Promise<{ ok?: true; error?: string }> {
  const { supabase, user, error } = await requireAdmin();
  if (error || !user) return { error: error ?? "Unauthorized" };

  const { data: all, error: fetchError } = await supabase
    .from("services")
    .select("id, display_order")
    .order("display_order", { ascending: true });

  if (fetchError) return { error: fetchError.message };
  const list = (all ?? []) as { id: string; display_order: number }[];
  const idx = list.findIndex((s) => s.id === id);
  if (idx === -1) return { error: "Service not found." };

  const swapIdx = direction === "up" ? idx - 1 : idx + 1;
  if (swapIdx < 0 || swapIdx >= list.length) return { ok: true };

  const a = list[idx];
  const b = list[swapIdx];

  const { error: e1 } = await supabase
    .from("services")
    .update({ display_order: b.display_order })
    .eq("id", a.id);
  if (e1) return { error: e1.message };
  const { error: e2 } = await supabase
    .from("services")
    .update({ display_order: a.display_order })
    .eq("id", b.id);
  if (e2) return { error: e2.message };

  revalidatePath("/service");
  revalidatePath("/admin/site-content");
  return { ok: true };
}
