"use server";

import { createClient } from "@/lib/supabase/server";
import {
  notifyAdmins,
  emailCustomer,
  renderVehicleEnquiryEmail,
  renderCustomerVehicleEnquiryConfirmation,
} from "@/lib/email";

interface SubmitArgs {
  vehicleId: string;
  name: string;
  email: string;
  phone: string;
  message: string;
}

function siteUrl() {
  return (
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://idealcarsltd.co.nz"
  ).replace(/\/$/, "");
}

export async function submitVehicleEnquiry(args: SubmitArgs) {
  const supabase = createClient();

  const { data: vehicle, error: vehicleError } = await supabase
    .from("vehicles")
    .select("id, year, make, model, stock_number, price")
    .eq("id", args.vehicleId)
    .single();

  if (vehicleError || !vehicle) {
    return { error: "Vehicle not found." };
  }

  const { error } = await supabase.from("vehicle_enquiries").insert({
    vehicle_id: args.vehicleId,
    name: args.name,
    email: args.email,
    phone: args.phone,
    message: args.message || null,
  });

  if (error) {
    return {
      error:
        "Sorry, we could not send your enquiry. Please try again or call us directly.",
    };
  }

  const vehicleContext = {
    year: vehicle.year,
    make: vehicle.make,
    model: vehicle.model,
    stockNumber: vehicle.stock_number,
    price: Number(vehicle.price),
    url: `${siteUrl()}/buy/${vehicle.id}`,
  };

  Promise.allSettled([
    notifyAdmins({
      subject: `Enquiry: ${vehicle.year} ${vehicle.make} ${vehicle.model} (Stock #${vehicle.stock_number})`,
      html: renderVehicleEnquiryEmail({
        name: args.name,
        email: args.email,
        phone: args.phone,
        message: args.message || null,
        vehicle: vehicleContext,
      }),
      replyTo: args.email,
    }),
    emailCustomer({
      to: args.email,
      subject: `Enquiry received: ${vehicle.year} ${vehicle.make} ${vehicle.model}`,
      html: renderCustomerVehicleEnquiryConfirmation(args.name, vehicleContext),
    }),
  ]).catch((err) => console.error("[vehicle enquiry] email error:", err));

  return { ok: true };
}
