"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { ConsumerInformationNotice } from "@/types/car";

export async function updateVehicleCin(
  id: string,
  cin: ConsumerInformationNotice,
) {
  const supabase = createClient();
  const { error } = await supabase
    .from("vehicles")
    .update({ cin })
    .eq("id", id);
  if (error) return { error: error.message };

  revalidatePath(`/admin/vehicles/${id}/edit`);
  revalidatePath(`/buy/${id}`);
  redirect(`/admin/vehicles/${id}/edit`);
}

export async function clearVehicleCin(id: string) {
  const supabase = createClient();
  const { error } = await supabase
    .from("vehicles")
    .update({ cin: null })
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath(`/admin/vehicles/${id}/edit`);
  revalidatePath(`/buy/${id}`);
}
