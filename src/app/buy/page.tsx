import type { Metadata } from "next";
import { Suspense } from "react";
import PageHeader from "@/components/layout/PageHeader";
import BuyContent from "./BuyContent";

export const metadata: Metadata = {
  title: "Buy a Car",
  description:
    "Browse our range of quality second-hand vehicles. Filter by make, model, price, and more to find your ideal car.",
};

export default function BuyPage() {
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
        <BuyContent />
      </Suspense>
    </>
  );
}
