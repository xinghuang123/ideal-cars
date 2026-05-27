"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

const SITE_IMAGES_BUCKET = "site-images";

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

export interface AboutTeamMemberFields {
  name: string;
  role: string;
  photo_url: string | null;
  is_active: boolean;
}

export async function createAboutTeamMember(): Promise<{
  ok?: true;
  id?: string;
  error?: string;
}> {
  const { supabase, user, error } = await requireAdmin();
  if (error || !user) return { error: error ?? "Unauthorized" };

  const { data: existing } = await supabase
    .from("about_team_members")
    .select("display_order")
    .order("display_order", { ascending: false })
    .limit(1);
  const nextOrder =
    existing && existing.length > 0
      ? (existing[0].display_order as number) + 1
      : 0;

  const { data, error: insertError } = await supabase
    .from("about_team_members")
    .insert({
      name: "New Member",
      role: "",
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

export async function updateAboutTeamMember(
  id: string,
  fields: AboutTeamMemberFields,
): Promise<{ ok?: true; error?: string }> {
  const { supabase, user, error } = await requireAdmin();
  if (error || !user) return { error: error ?? "Unauthorized" };

  const { error: updateError } = await supabase
    .from("about_team_members")
    .update({
      name: fields.name.trim(),
      role: fields.role.trim(),
      photo_url: fields.photo_url,
      is_active: fields.is_active,
      updated_by: user.id,
    })
    .eq("id", id);

  if (updateError) return { error: updateError.message };
  revalidatePath("/about");
  revalidatePath("/admin/site-content");
  return { ok: true };
}

export async function deleteAboutTeamMember(
  id: string,
): Promise<{ ok?: true; error?: string }> {
  const { supabase, user, error } = await requireAdmin();
  if (error || !user) return { error: error ?? "Unauthorized" };

  // Best effort: remove the photo file if it lives in site-images.
  const { data: row } = await supabase
    .from("about_team_members")
    .select("photo_url")
    .eq("id", id)
    .single();

  const photoUrl = (row as { photo_url: string | null } | null)?.photo_url;
  if (photoUrl) {
    const path = extractSiteImagePath(photoUrl);
    if (path) {
      await supabase.storage.from(SITE_IMAGES_BUCKET).remove([path]);
    }
  }

  const { error: deleteError } = await supabase
    .from("about_team_members")
    .delete()
    .eq("id", id);

  if (deleteError) return { error: deleteError.message };
  revalidatePath("/about");
  revalidatePath("/admin/site-content");
  return { ok: true };
}

export async function reorderAboutTeamMember(
  id: string,
  direction: "up" | "down",
): Promise<{ ok?: true; error?: string }> {
  const { supabase, user, error } = await requireAdmin();
  if (error || !user) return { error: error ?? "Unauthorized" };

  const { data: all, error: fetchError } = await supabase
    .from("about_team_members")
    .select("id, display_order")
    .order("display_order", { ascending: true });

  if (fetchError) return { error: fetchError.message };
  const list = (all ?? []) as { id: string; display_order: number }[];
  const idx = list.findIndex((s) => s.id === id);
  if (idx === -1) return { error: "Team member not found." };

  const swapIdx = direction === "up" ? idx - 1 : idx + 1;
  if (swapIdx < 0 || swapIdx >= list.length) return { ok: true };

  const a = list[idx];
  const b = list[swapIdx];

  const { error: e1 } = await supabase
    .from("about_team_members")
    .update({ display_order: b.display_order })
    .eq("id", a.id);
  if (e1) return { error: e1.message };
  const { error: e2 } = await supabase
    .from("about_team_members")
    .update({ display_order: a.display_order })
    .eq("id", b.id);
  if (e2) return { error: e2.message };

  revalidatePath("/about");
  revalidatePath("/admin/site-content");
  return { ok: true };
}

function extractSiteImagePath(publicUrl: string): string | null {
  const marker = `/object/public/${SITE_IMAGES_BUCKET}/`;
  const i = publicUrl.indexOf(marker);
  if (i === -1) return null;
  return publicUrl.slice(i + marker.length);
}
