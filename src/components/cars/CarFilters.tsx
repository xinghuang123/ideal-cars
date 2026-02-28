"use client";

import { useState } from "react";
import { CarFilters as CarFiltersType } from "@/types/car";
import { carMakes, carModels, bodyTypes, fuelTypes, transmissionTypes } from "@/data/makes";

interface CarFiltersProps {
  filters: CarFiltersType;
  onFilterChange: (filters: CarFiltersType) => void;
}

const pricePresets = [5000, 10000, 15000, 20000, 25000, 30000, 40000, 50000];
const yearRange = Array.from({ length: 10 }, (_, i) => 2024 - i); // 2024 down to 2015

const sortOptions: { value: CarFiltersType["sortBy"]; label: string }[] = [
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "year-desc", label: "Year: Newest First" },
  { value: "year-asc", label: "Year: Oldest First" },
  { value: "mileage-asc", label: "Mileage: Lowest First" },
];

function formatPriceLabel(price: number): string {
  return `$${(price / 1000).toFixed(0)}k`;
}

export default function CarFilters({ filters, onFilterChange }: CarFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);

  const updateFilter = (key: keyof CarFiltersType, value: string | number | undefined) => {
    const updated = { ...filters, [key]: value || undefined };

    // Reset model when make changes
    if (key === "make") {
      updated.model = undefined;
    }

    onFilterChange(updated);
  };

  const clearFilters = () => {
    onFilterChange({});
  };

  const hasActiveFilters = Object.values(filters).some((v) => v !== undefined);

  const availableModels = filters.make ? carModels[filters.make] || [] : [];

  return (
    <div className="rounded-xl bg-white shadow-sm border border-gray-100">
      {/* Mobile toggle */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between p-4 lg:hidden"
      >
        <span className="text-lg font-semibold text-navy">Filters</span>
        <svg
          className={`h-5 w-5 text-navy transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Filter content */}
      <div className={`${isOpen ? "block" : "hidden"} lg:block`}>
        <div className="space-y-5 p-4 pt-0 lg:pt-4">
          {/* Header - desktop only */}
          <h3 className="hidden text-lg font-semibold text-navy lg:block">
            Filter Vehicles
          </h3>

          {/* Make */}
          <div>
            <label htmlFor="filter-make" className="mb-1.5 block text-sm font-medium text-navy">
              Make
            </label>
            <select
              id="filter-make"
              value={filters.make || ""}
              onChange={(e) => updateFilter("make", e.target.value)}
              className="w-full appearance-none rounded-lg border border-silver bg-white px-3 py-2 text-sm text-navy focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30"
            >
              <option value="">All Makes</option>
              {carMakes.map((make) => (
                <option key={make} value={make}>
                  {make}
                </option>
              ))}
            </select>
          </div>

          {/* Model */}
          <div>
            <label htmlFor="filter-model" className="mb-1.5 block text-sm font-medium text-navy">
              Model
            </label>
            <select
              id="filter-model"
              value={filters.model || ""}
              onChange={(e) => updateFilter("model", e.target.value)}
              disabled={!filters.make}
              className="w-full appearance-none rounded-lg border border-silver bg-white px-3 py-2 text-sm text-navy focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:opacity-60"
            >
              <option value="">All Models</option>
              {availableModels.map((model) => (
                <option key={model} value={model}>
                  {model}
                </option>
              ))}
            </select>
          </div>

          {/* Year range */}
          <div>
            <span className="mb-1.5 block text-sm font-medium text-navy">Year</span>
            <div className="flex items-center gap-2">
              <select
                id="filter-year-min"
                value={filters.yearMin || ""}
                onChange={(e) =>
                  updateFilter("yearMin", e.target.value ? Number(e.target.value) : undefined)
                }
                className="w-full appearance-none rounded-lg border border-silver bg-white px-3 py-2 text-sm text-navy focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30"
              >
                <option value="">Min</option>
                {yearRange
                  .slice()
                  .reverse()
                  .map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
              </select>
              <span className="text-sm text-silver-dark">to</span>
              <select
                id="filter-year-max"
                value={filters.yearMax || ""}
                onChange={(e) =>
                  updateFilter("yearMax", e.target.value ? Number(e.target.value) : undefined)
                }
                className="w-full appearance-none rounded-lg border border-silver bg-white px-3 py-2 text-sm text-navy focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30"
              >
                <option value="">Max</option>
                {yearRange.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Price range */}
          <div>
            <span className="mb-1.5 block text-sm font-medium text-navy">Price</span>
            <div className="flex items-center gap-2">
              <select
                id="filter-price-min"
                value={filters.priceMin || ""}
                onChange={(e) =>
                  updateFilter("priceMin", e.target.value ? Number(e.target.value) : undefined)
                }
                className="w-full appearance-none rounded-lg border border-silver bg-white px-3 py-2 text-sm text-navy focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30"
              >
                <option value="">Min</option>
                {pricePresets.map((p) => (
                  <option key={p} value={p}>
                    {formatPriceLabel(p)}
                  </option>
                ))}
              </select>
              <span className="text-sm text-silver-dark">to</span>
              <select
                id="filter-price-max"
                value={filters.priceMax || ""}
                onChange={(e) =>
                  updateFilter("priceMax", e.target.value ? Number(e.target.value) : undefined)
                }
                className="w-full appearance-none rounded-lg border border-silver bg-white px-3 py-2 text-sm text-navy focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30"
              >
                <option value="">Max</option>
                {pricePresets.map((p) => (
                  <option key={p} value={p}>
                    {formatPriceLabel(p)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Fuel Type */}
          <div>
            <label htmlFor="filter-fuel" className="mb-1.5 block text-sm font-medium text-navy">
              Fuel Type
            </label>
            <select
              id="filter-fuel"
              value={filters.fuelType || ""}
              onChange={(e) => updateFilter("fuelType", e.target.value)}
              className="w-full appearance-none rounded-lg border border-silver bg-white px-3 py-2 text-sm text-navy focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30"
            >
              <option value="">All Fuel Types</option>
              {fuelTypes.map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </select>
          </div>

          {/* Transmission */}
          <div>
            <label htmlFor="filter-trans" className="mb-1.5 block text-sm font-medium text-navy">
              Transmission
            </label>
            <select
              id="filter-trans"
              value={filters.transmission || ""}
              onChange={(e) => updateFilter("transmission", e.target.value)}
              className="w-full appearance-none rounded-lg border border-silver bg-white px-3 py-2 text-sm text-navy focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30"
            >
              <option value="">All Transmissions</option>
              {transmissionTypes.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          {/* Body Type */}
          <div>
            <label htmlFor="filter-body" className="mb-1.5 block text-sm font-medium text-navy">
              Body Type
            </label>
            <select
              id="filter-body"
              value={filters.bodyType || ""}
              onChange={(e) => updateFilter("bodyType", e.target.value)}
              className="w-full appearance-none rounded-lg border border-silver bg-white px-3 py-2 text-sm text-navy focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30"
            >
              <option value="">All Body Types</option>
              {bodyTypes.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </div>

          {/* Sort By */}
          <div>
            <label htmlFor="filter-sort" className="mb-1.5 block text-sm font-medium text-navy">
              Sort By
            </label>
            <select
              id="filter-sort"
              value={filters.sortBy || ""}
              onChange={(e) =>
                updateFilter("sortBy", e.target.value as CarFiltersType["sortBy"])
              }
              className="w-full appearance-none rounded-lg border border-silver bg-white px-3 py-2 text-sm text-navy focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30"
            >
              <option value="">Default</option>
              {sortOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Clear Filters */}
          {hasActiveFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="w-full rounded-lg border-2 border-silver bg-transparent px-4 py-2.5 text-sm font-semibold text-navy transition-colors duration-200 hover:bg-gray-50"
            >
              Clear Filters
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
