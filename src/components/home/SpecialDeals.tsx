import Link from "next/link";
import { getSpecialCars } from "@/data/cars";
import CarCard from "@/components/cars/CarCard";
import SectionHeading from "@/components/ui/SectionHeading";
import Container from "@/components/ui/Container";

export default function SpecialDeals() {
  const specialCars = getSpecialCars();

  if (specialCars.length === 0) return null;

  return (
    <section className="py-16">
      <Container>
        <SectionHeading
          title="Special Deals"
          subtitle="Hand-picked vehicles at unbeatable prices"
        />

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {specialCars.map((car) => (
            <CarCard key={car.id} car={car} />
          ))}
        </div>

        <div className="mt-10 text-center">
          <Link
            href="/buy"
            className="inline-flex items-center gap-2 font-semibold text-accent-dark transition-colors duration-200 hover:text-accent"
          >
            View All Cars
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="h-5 w-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
              />
            </svg>
          </Link>
        </div>
      </Container>
    </section>
  );
}
