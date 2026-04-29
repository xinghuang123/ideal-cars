import type { Metadata } from "next";
import { Suspense } from "react";
import PageHeader from "@/components/layout/PageHeader";
import BuyContent from "./BuyContent";
import { getAvailableVehicles } from "@/lib/vehicles";

export const metadata: Metadata = {
  title: "Buy a Car",
  description:
    "Browse our range of quality second-hand vehicles. Filter by make, model, price, and more to find your ideal car.",
};

export default async function BuyPage() {
  const cars = await getAvailableVehicles();

  return (
    <>
      <PageHeader
        title="Buy a Car"
        subtitle="Browse our range of quality used vehicles"
      />
      <Suspense
        fallback={
          <div className="flex min-h-[400px] items-center justify-center">
            <div className="text-silver-dark">Loading vehicles...</div>
          </div>
        }
      >
        <BuyContent allCars={cars} />
      </Suspense>
    </>
  );
}
