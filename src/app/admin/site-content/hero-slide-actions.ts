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

export interface HeroSlideFields {
  image_url: string | null;
  heading: string;
  subheading: string;
  button_text: string;
  button_href: string;
  gradient_class: string | null;
  is_active: boolean;
}

export async function createHeroSlide(): Promise<{
  ok?: true;
  id?: string;
  error?: string;
}> {
  const { supabase, user, error } = await requireAdmin();
  if (error || !user) return { error: error ?? "Unauthorized" };

  // Place new slide at the end.
  const { data: existing } = await supabase
    .from("hero_slides")
    .select("display_order")
    .order("display_order", { ascending: false })
    .limit(1);
  const nextOrder =
    existing && existing.length > 0 ? (existing[0].display_order as number) + 1 : 0;

  const { data, error: insertError } = await supabase
    .from("hero_slides")
    .insert({
      heading: "New Slide",
      subheading: "",
      button_text: "",
      button_href: "",
      display_order: nextOrder,
      is_active: true,
      updated_by: user.id,
    })
    .select("id")
    .single();

  if (insertError) return { error: insertError.message };
  revalidatePath("/");
  revalidatePath("/admin/site-content");
  return { ok: true, id: (data as { id: string }).id };
}

export async function updateHeroSlide(
  id: string,
  fields: HeroSlideFields,
): Promise<{ ok?: true; error?: string }> {
  const { supabase, user, error } = await requireAdmin();
  if (error || !user) return { error: error ?? "Unauthorized" };

  const { error: updateError } = await supabase
    .from("hero_slides")
    .update({
      image_url: fields.image_url,
      heading: fields.heading.trim(),
      subheading: fields.subheading.trim(),
      button_text: fields.button_text.trim(),
      button_href: fields.button_href.trim(),
      gradient_class: fields.gradient_class?.trim() || null,
      is_active: fields.is_active,
      updated_by: user.id,
    })
    .eq("id", id);

  if (updateError) return { error: updateError.message };
  revalidatePath("/");
  revalidatePath("/admin/site-content");
  return { ok: true };
}

export async function deleteHeroSlide(
  id: string,
): Promise<{ ok?: true; error?: string }> {
  const { supabase, user, error } = await requireAdmin();
  if (error || !user) return { error: error ?? "Unauthorized" };

  // Best effort: also remove the storage object if it lives in site-images.
  const { data: row } = await supabase
    .from("hero_slides")
    .select("image_url")
    .eq("id", id)
    .single();

  const imageUrl = (row as { image_url: string | null } | null)?.image_url;
  if (imageUrl) {
    const path = extractSiteImagePath(imageUrl);
    if (path) {
      await supabase.storage.from(SITE_IMAGES_BUCKET).remove([path]);
    }
  }

  const { error: deleteError } = await supabase
    .from("hero_slides")
    .delete()
    .eq("id", id);

  if (deleteError) return { error: deleteError.message };
  revalidatePath("/");
  revalidatePath("/admin/site-content");
  return { ok: true };
}

export async function reorderHeroSlide(
  id: string,
  direction: "up" | "down",
): Promise<{ ok?: true; error?: string }> {
  const { supabase, user, error } = await requireAdmin();
  if (error || !user) return { error: error ?? "Unauthorized" };

  const { data: all, error: fetchError } = await supabase
    .from("hero_slides")
    .select("id, display_order")
    .order("display_order", { ascending: true });

  if (fetchError) return { error: fetchError.message };
  const list = (all ?? []) as { id: string; display_order: number }[];
  const idx = list.findIndex((s) => s.id === id);
  if (idx === -1) return { error: "Slide not found." };

  const swapIdx = direction === "up" ? idx - 1 : idx + 1;
  if (swapIdx < 0 || swapIdx >= list.length) return { ok: true }; // no-op at edges

  const a = list[idx];
  const b = list[swapIdx];

  // Swap display_order between the two rows.
  const { error: e1 } = await supabase
    .from("hero_slides")
    .update({ display_order: b.display_order })
    .eq("id", a.id);
  if (e1) return { error: e1.message };
  const { error: e2 } = await supabase
    .from("hero_slides")
    .update({ display_order: a.display_order })
    .eq("id", b.id);
  if (e2) return { error: e2.message };

  revalidatePath("/");
  revalidatePath("/admin/site-content");
  return { ok: true };
}

function extractSiteImagePath(publicUrl: string): string | null {
  const marker = `/object/public/${SITE_IMAGES_BUCKET}/`;
  const i = publicUrl.indexOf(marker);
  if (i === -1) return null;
  return publicUrl.slice(i + marker.length);
}
