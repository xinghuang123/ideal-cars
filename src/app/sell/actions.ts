"use server";

import { createClient } from "@/lib/supabase/server";
import {
  notifyAdmins,
  emailCustomer,
  renderSellCarEnquiryEmail,
  renderCustomerSellConfirmation,
} from "@/lib/email";
import type {
  FuelType,
  TransmissionType,
  SellCondition,
} from "@/types/database";

interface SubmitArgs {
  name: string;
  email: string;
  phone: string;
  make: string;
  model: string;
  year: number;
  mileage: number;
  fuelType: string;
  transmission: string;
  condition: string;
  description: string | null;
  expectedPrice: number | null;
}

export async function submitSellCarEnquiry(args: SubmitArgs) {
  const supabase = createClient();
  const { error } = await supabase.from("sell_car_enquiries").insert({
    name: args.name,
    email: args.email,
    phone: args.phone,
    make: args.make,
    model: args.model,
    year: args.year,
    mileage: args.mileage,
    fuel_type: args.fuelType as FuelType,
    transmission: args.transmission as TransmissionType,
    condition: args.condition as SellCondition,
    description: args.description,
    expected_price: args.expectedPrice,
  });

  if (error) {
    return {
      error:
        "Sorry, we could not submit your valuation request. Please try again or call us directly.",
    };
  }

  Promise.allSettled([
    notifyAdmins({
      subject: `New sell request: ${args.year} ${args.make} ${args.model}`,
      html: renderSellCarEnquiryEmail(args),
      replyTo: args.email,
    }),
    emailCustomer({
      to: args.email,
      subject: "Valuation request received — Ideal Cars",
      html: renderCustomerSellConfirmation(args.name, {
        year: args.year,
        make: args.make,
        model: args.model,
      }),
    }),
  ]).catch((err) => console.error("[sell] email error:", err));

  return { ok: true };
}
