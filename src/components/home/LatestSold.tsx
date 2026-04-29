import { getSoldVehicles } from "@/lib/vehicles";
import CarCard from "@/components/cars/CarCard";
import SectionHeading from "@/components/ui/SectionHeading";
import Container from "@/components/ui/Container";

export default async function LatestSold() {
  const soldCars = await getSoldVehicles();

  if (soldCars.length === 0) return null;

  return (
    <section className="bg-gray-50 py-16">
      <Container>
        <SectionHeading
          title="Recently Sold"
          subtitle="See what our happy customers have driven away in"
        />

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {soldCars.map((car) => (
            <CarCard key={car.id} car={car} />
          ))}
        </div>
      </Container>
    </section>
  );
}
