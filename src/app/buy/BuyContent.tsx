"use client";

import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { CarFilters as CarFiltersType } from "@/types/car";
import { getAvailableCars } from "@/data/cars";
import Container from "@/components/ui/Container";
import CarFilters from "@/components/cars/CarFilters";
import CarGrid from "@/components/cars/CarGrid";

export default function BuyContent() {
  const searchParams = useSearchParams();
  const [filters, setFilters] = useState<CarFiltersType>({});

  useEffect(() => {
    const initial: CarFiltersType = {};
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

  const allCars = useMemo(() => getAvailableCars(), []);

  const filteredCars = useMemo(() => {
    let result = [...allCars];

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

  return (
    <section className="bg-gray-50 py-10 sm:py-14">
      <Container>
        <p className="mb-6 text-sm font-medium text-silver-dark">
          Showing{" "}
          <span className="font-bold text-navy">{filteredCars.length}</span>{" "}
          vehicle{filteredCars.length !== 1 ? "s" : ""}
        </p>

        <div className="flex flex-col gap-8 lg:flex-row">
          <aside className="w-full shrink-0 lg:w-1/4">
            <CarFilters filters={filters} onFilterChange={setFilters} />
          </aside>

          <div className="flex-1">
            <CarGrid cars={filteredCars} />
          </div>
        </div>
      </Container>
    </section>
  );
}
