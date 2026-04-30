"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { emailCustomer, renderCustomerWelcomeEmail } from "@/lib/email";

export async function sendWelcomeEmail(email: string, fullName: string | null) {
  if (!email) return;
  await emailCustomer({
    to: email,
    subject: "Welcome to Ideal Cars",
    html: renderCustomerWelcomeEmail(fullName),
  });
}

interface ProfileUpdate {
  full_name: string;
  phone: string | null;
  address_line1: string | null;
  address_line2: string | null;
  city: string | null;
  region: string | null;
  postcode: string | null;
}

export async function updateProfile(values: ProfileUpdate) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not signed in." };

  const { error } = await supabase
    .from("customer_profiles")
    .update({
      full_name: values.full_name.trim() || null,
      phone: values.phone?.trim() || null,
      address_line1: values.address_line1?.trim() || null,
      address_line2: values.address_line2?.trim() || null,
      city: values.city?.trim() || null,
      region: values.region?.trim() || null,
      postcode: values.postcode?.trim() || null,
    })
    .eq("id", user.id);

  if (error) return { error: error.message };

  revalidatePath("/account");
  revalidatePath("/account/profile");
  return { ok: true };
}
