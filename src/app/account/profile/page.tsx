import { getCurrentCustomer } from "@/lib/auth";
import ProfileForm from "./ProfileForm";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const customer = await getCurrentCustomer();
  if (!customer) return null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-navy">Personal Profile</h1>
        <p className="mt-1 text-sm text-silver-dark">
          Keep your contact details up to date so we can reach you about your
          vehicle.
        </p>
      </div>
      <ProfileForm
        email={customer.email}
        initial={{
          full_name: customer.profile?.full_name ?? "",
          phone: customer.profile?.phone ?? "",
          address_line1: customer.profile?.address_line1 ?? "",
          address_line2: customer.profile?.address_line2 ?? "",
          city: customer.profile?.city ?? "",
          region: customer.profile?.region ?? "",
          postcode: customer.profile?.postcode ?? "",
        }}
      />
    </div>
  );
}
