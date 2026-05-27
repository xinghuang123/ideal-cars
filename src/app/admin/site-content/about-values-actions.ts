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

export interface AboutValueFields {
  title: string;
  description: string;
  is_active: boolean;
}

export async function createAboutValue(): Promise<{
  ok?: true;
  id?: string;
  error?: string;
}> {
  const { supabase, user, error } = await requireAdmin();
  if (error || !user) return { error: error ?? "Unauthorized" };

  const { data: existing } = await supabase
    .from("about_values")
    .select("display_order")
    .order("display_order", { ascending: false })
    .limit(1);
  const nextOrder =
    existing && existing.length > 0
      ? (existing[0].display_order as number) + 1
      : 0;

  const { data, error: insertError } = await supabase
    .from("about_values")
    .insert({
      title: "New Value",
      description: "",
      display_order: nextOrder,
      is_active: true,
      updated_by: user.id,
    })
    .select("id")
    .single();

  if (insertError) return { error: insertError.message };
  revalidatePath("/about");
  revalidatePath("/admin/site-content");
  return { ok: true, id: (data as { id: string }).id };
}

export async function updateAboutValue(
  id: string,
  fields: AboutValueFields,
): Promise<{ ok?: true; error?: string }> {
  const { supabase, user, error } = await requireAdmin();
  if (error || !user) return { error: error ?? "Unauthorized" };

  const { error: updateError } = await supabase
    .from("about_values")
    .update({
      title: fields.title.trim(),
      description: fields.description.trim(),
      is_active: fields.is_active,
      updated_by: user.id,
    })
    .eq("id", id);

  if (updateError) return { error: updateError.message };
  revalidatePath("/about");
  revalidatePath("/admin/site-content");
  return { ok: true };
}

export async function deleteAboutValue(
  id: string,
): Promise<{ ok?: true; error?: string }> {
  const { supabase, user, error } = await requireAdmin();
  if (error || !user) return { error: error ?? "Unauthorized" };

  const { error: deleteError } = await supabase
    .from("about_values")
    .delete()
    .eq("id", id);

  if (deleteError) return { error: deleteError.message };
  revalidatePath("/about");
  revalidatePath("/admin/site-content");
  return { ok: true };
}

export async function reorderAboutValue(
  id: string,
  direction: "up" | "down",
): Promise<{ ok?: true; error?: string }> {
  const { supabase, user, error } = await requireAdmin();
  if (error || !user) return { error: error ?? "Unauthorized" };

  const { data: all, error: fetchError } = await supabase
    .from("about_values")
    .select("id, display_order")
    .order("display_order", { ascending: true });

  if (fetchError) return { error: fetchError.message };
  const list = (all ?? []) as { id: string; display_order: number }[];
  const idx = list.findIndex((s) => s.id === id);
  if (idx === -1) return { error: "Value not found." };

  const swapIdx = direction === "up" ? idx - 1 : idx + 1;
  if (swapIdx < 0 || swapIdx >= list.length) return { ok: true };

  const a = list[idx];
  const b = list[swapIdx];

  const { error: e1 } = await supabase
    .from("about_values")
    .update({ display_order: b.display_order })
    .eq("id", a.id);
  if (e1) return { error: e1.message };
  const { error: e2 } = await supabase
    .from("about_values")
    .update({ display_order: a.display_order })
    .eq("id", b.id);
  if (e2) return { error: e2.message };

  revalidatePath("/about");
  revalidatePath("/admin/site-content");
  return { ok: true };
}
