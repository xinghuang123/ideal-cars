import Link from "next/link";
import { Car } from "@/types/car";
import { formatPrice, formatMileage } from "@/lib/utils";
import Badge from "@/components/ui/Badge";

interface CarCardProps {
  car: Car;
}

export default function CarCard({ car }: CarCardProps) {
  return (
    <div className="group overflow-hidden rounded-xl bg-white shadow-sm border border-gray-100 transition-shadow duration-300 hover:shadow-lg">
      {/* Image placeholder */}
      <div className="relative h-48 bg-gray-200">
        <div className="flex h-full items-center justify-center text-gray-500 font-medium">
          {car.make} {car.model}
        </div>

        {/* Status badge */}
        {car.status === "special" && (
          <Badge
            variant="special"
            className="absolute top-3 left-3 text-xs uppercase tracking-wide"
          >
            Special Deal
          </Badge>
        )}
        {car.status === "sold" && (
          <Badge
            variant="sold"
            className="absolute top-3 left-3 text-xs uppercase tracking-wide"
          >
            Sold
          </Badge>
        )}
      </div>

      {/* Card body */}
      <div className="p-4">
        {/* Title */}
        <h3 className="text-lg font-bold text-navy">
          {car.make} {car.model}
        </h3>

        {/* Specs row */}
        <div className="mt-1.5 flex items-center gap-2 text-sm text-silver-dark">
          <span>{car.year}</span>
          <span className="text-silver">|</span>
          <span>{formatMileage(car.mileage)}</span>
          <span className="text-silver">|</span>
          <span>{car.fuelType}</span>
        </div>

        {/* Price and CTA */}
        <div className="mt-4 flex items-center justify-between">
          <span className="text-xl font-bold text-accent-dark">
            {formatPrice(car.price)}
          </span>
          <Link
            href={`/buy/${car.id}`}
            className="rounded-lg bg-navy px-4 py-2 text-sm font-semibold text-white transition-colors duration-200 hover:bg-navy-light"
          >
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
}
