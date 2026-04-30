"use client";

import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { Car, CarFilters as CarFiltersType } from "@/types/car";
import Container from "@/components/ui/Container";
import CarFilters from "@/components/cars/CarFilters";
import CarGrid from "@/components/cars/CarGrid";
import Pagination from "@/components/ui/Pagination";

const PAGE_SIZE = 12;

export default function BuyContent({ allCars }: { allCars: Car[] }) {
  const searchParams = useSearchParams();
  const [filters, setFilters] = useState<CarFiltersType>({});
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const initial: CarFiltersType = {};
    const keyword = searchParams.get("keyword");
    const make = searchParams.get("make");
    const model = searchParams.get("model");
    const yearMin = searchParams.get("yearMin");
    const yearMax = searchParams.get("yearMax");
    const priceMin = searchParams.get("priceMin");
    const priceMax = searchParams.get("priceMax");
    const fuelType = searchParams.get("fuelType");
    const transmission = searchParams.get("transmission");
    const bodyType = searchParams.get("bodyType");
    const sortBy = searchParams.get("sortBy");

    if (keyword) initial.keyword = keyword;
    if (make) initial.make = make;
    if (model) initial.model = model;
    if (yearMin) initial.yearMin = Number(yearMin);
    if (yearMax) initial.yearMax = Number(yearMax);
    if (priceMin) initial.priceMin = Number(priceMin);
    if (priceMax) initial.priceMax = Number(priceMax);
    if (fuelType) initial.fuelType = fuelType;
    if (transmission) initial.transmission = transmission;
    if (bodyType) initial.bodyType = bodyType;
    if (sortBy) initial.sortBy = sortBy as CarFiltersType["sortBy"];

    if (Object.keys(initial).length > 0) {
      setFilters(initial);
    }
  }, [searchParams]);

  const filteredCars = useMemo(() => {
    let result = [...allCars];

    if (filters.keyword) {
      const kw = filters.keyword.toLowerCase();
      result = result.filter((car) => {
        const searchable = [
          car.make,
          car.model,
          car.description,
          car.bodyType,
          car.fuelType,
          car.transmission,
          car.colour,
          car.driveType,
          car.engineSize,
          String(car.year),
          ...car.features,
        ]
          .join(" ")
          .toLowerCase();
        return searchable.includes(kw);
      });
    }
    if (filters.make) {
      result = result.filter((car) => car.make === filters.make);
    }
    if (filters.model) {
      result = result.filter((car) => car.model === filters.model);
    }
    if (filters.yearMin) {
      result = result.filter((car) => car.year >= filters.yearMin!);
    }
    if (filters.yearMax) {
      result = result.filter((car) => car.year <= filters.yearMax!);
    }
    if (filters.priceMin) {
      result = result.filter((car) => car.price >= filters.priceMin!);
    }
    if (filters.priceMax) {
      result = result.filter((car) => car.price <= filters.priceMax!);
    }
    if (filters.fuelType) {
      result = result.filter((car) => car.fuelType === filters.fuelType);
    }
    if (filters.transmission) {
      result = result.filter(
        (car) => car.transmission === filters.transmission,
      );
    }
    if (filters.bodyType) {
      result = result.filter((car) => car.bodyType === filters.bodyType);
    }

    switch (filters.sortBy) {
      case "price-asc":
        result.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        result.sort((a, b) => b.price - a.price);
        break;
      case "year-desc":
        result.sort((a, b) => b.year - a.year);
        break;
      case "year-asc":
        result.sort((a, b) => a.year - b.year);
        break;
      case "mileage-asc":
        result.sort((a, b) => a.mileage - b.mileage);
        break;
    }

    return result;
  }, [allCars, filters]);

  // Reset to first page whenever the filtered set changes
  useEffect(() => {
    setCurrentPage(1);
  }, [filters]);

  const totalPages = Math.max(1, Math.ceil(filteredCars.length / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);
  const pagedCars = filteredCars.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE,
  );

  return (
    <section className="bg-gray-50 py-10 sm:py-14">
      <Container>
        <p className="mb-6 text-sm font-medium text-silver-dark">
          Showing{" "}
          <span className="font-bold text-navy">
            {filteredCars.length === 0
              ? 0
              : `${(safePage - 1) * PAGE_SIZE + 1}–${Math.min(
                  safePage * PAGE_SIZE,
                  filteredCars.length,
                )}`}
          </span>{" "}
          of <span className="font-bold text-navy">{filteredCars.length}</span>{" "}
          vehicle{filteredCars.length !== 1 ? "s" : ""}
        </p>

        <div className="flex flex-col gap-8 lg:flex-row">
          <aside className="w-full shrink-0 lg:w-1/4">
            <CarFilters filters={filters} onFilterChange={setFilters} />
          </aside>

          <div className="flex-1">
            <CarGrid cars={pagedCars} />
            <Pagination
              currentPage={safePage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        </div>
      </Container>
    </section>
  );
}
