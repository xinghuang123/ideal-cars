"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { BasicConditionGuide } from "@/types/car";

export async function updateVehicleBcg(
  id: string,
  bcg: BasicConditionGuide,
) {
  const supabase = createClient();
  const { error } = await supabase
    .from("vehicles")
    .update({ bcg })
    .eq("id", id);
  if (error) return { error: error.message };

  revalidatePath(`/admin/vehicles/${id}/edit`);
  revalidatePath(`/buy/${id}`);
  return { ok: true as const };
}

export async function clearVehicleBcg(id: string) {
  const supabase = createClient();
  const { error } = await supabase
    .from("vehicles")
    .update({ bcg: null })
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath(`/admin/vehicles/${id}/edit`);
  revalidatePath(`/buy/${id}`);
}
