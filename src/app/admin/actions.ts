"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { EnquiryStatus } from "@/types/database";

const enquiryTables = [
  "contact_enquiries",
  "sell_car_enquiries",
  "vehicle_enquiries",
  "finance_applications",
] as const;

export async function updateEnquiryStatus(
  table: (typeof enquiryTables)[number],
  id: string,
  status: EnquiryStatus,
) {
  if (!enquiryTables.includes(table)) throw new Error("Invalid table");

  const supabase = createClient();
  const { error } = await supabase
    .from(table)
    .update({ status })
    .eq("id", id);

  if (error) throw new Error(error.message);

  revalidatePath(`/admin/${table === "contact_enquiries" ? "contact" : table === "sell_car_enquiries" ? "sell-requests" : table === "vehicle_enquiries" ? "vehicle-enquiries" : "finance"}`);
  revalidatePath("/admin");
}

export async function setSubscriberActive(id: string, isActive: boolean) {
  const supabase = createClient();
  const { error } = await supabase
    .from("newsletter_subscribers")
    .update({
      is_active: isActive,
      unsubscribed_at: isActive ? null : new Date().toISOString(),
    })
    .eq("id", id);

  if (error) throw new Error(error.message);
  revalidatePath("/admin/subscribers");
  revalidatePath("/admin");
}
