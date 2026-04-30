import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export interface CustomerProfile {
  id: string;
  full_name: string | null;
  phone: string | null;
  address_line1: string | null;
  address_line2: string | null;
  city: string | null;
  region: string | null;
  postcode: string | null;
}

export interface CurrentCustomer {
  userId: string;
  email: string;
  profile: CustomerProfile | null;
  isAdmin: boolean;
}

export async function getCurrentCustomer(): Promise<CurrentCustomer | null> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const role = (user.app_metadata as Record<string, unknown> | undefined)?.role;
  const isAdmin = role === "admin";

  const { data: profile } = await supabase
    .from("customer_profiles")
    .select(
      "id, full_name, phone, address_line1, address_line2, city, region, postcode",
    )
    .eq("id", user.id)
    .maybeSingle();

  return {
    userId: user.id,
    email: user.email ?? "",
    profile: (profile as CustomerProfile | null) ?? null,
    isAdmin,
  };
}

export async function requireCustomer(): Promise<CurrentCustomer> {
  const customer = await getCurrentCustomer();
  if (!customer) {
    redirect("/login?redirect=/account");
  }
  if (customer.isAdmin) {
    // Admins are not customers — bounce to admin dashboard.
    redirect("/admin");
  }
  return customer;
}
