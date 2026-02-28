"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { carMakes, carModels } from "@/data/makes";
import Container from "@/components/ui/Container";

const priceRanges = [
  { label: "Any Price", min: "", max: "" },
  { label: "Under $15,000", min: "", max: "15000" },
  { label: "$15,000 - $25,000", min: "15000", max: "25000" },
  { label: "$25,000 - $35,000", min: "25000", max: "35000" },
  { label: "$35,000 - $50,000", min: "35000", max: "50000" },
  { label: "Over $50,000", min: "50000", max: "" },
];

export default function SearchSection() {
  const router = useRouter();
  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [priceRange, setPriceRange] = useState("0");

  const models = make ? carModels[make] ?? [] : [];

  function handleMakeChange(value: string) {
    setMake(value);
    setModel("");
  }

  function handleSearch() {
    const params = new URLSearchParams();
    if (make) params.set("make", make);
    if (model) params.set("model", model);

    const range = priceRanges[Number(priceRange)];
    if (range) {
      if (range.min) params.set("priceMin", range.min);
      if (range.max) params.set("priceMax", range.max);
    }

    const query = params.toString();
    router.push(query ? `/buy?${query}` : "/buy");
  }

  const selectClasses =
    "w-full appearance-none rounded-lg border border-silver bg-white px-4 py-2.5 pr-10 text-navy transition-colors duration-200 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30 bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2020%2020%22%20fill%3D%22%231E2A3A%22%3E%3Cpath%20fill-rule%3D%22evenodd%22%20d%3D%22M5.23%207.21a.75.75%200%20011.06.02L10%2011.168l3.71-3.938a.75.75%200%20111.08%201.04l-4.25%204.5a.75.75%200%2001-1.08%200l-4.25-4.5a.75.75%200%2001.02-1.06z%22%20clip-rule%3D%22evenodd%22%2F%3E%3C%2Fsvg%3E')] bg-[length:1.25rem_1.25rem] bg-[right_0.75rem_center] bg-no-repeat";

  return (
    <section className="bg-navy-light py-8">
      <Container>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
          {/* Make */}
          <div className="flex-1">
            <label
              htmlFor="search-make"
              className="mb-1.5 block text-sm font-medium text-white"
            >
              Make
            </label>
            <select
              id="search-make"
              value={make}
              onChange={(e) => handleMakeChange(e.target.value)}
              className={selectClasses}
            >
              <option value="">All Makes</option>
              {carMakes.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>

          {/* Model */}
          <div className="flex-1">
            <label
              htmlFor="search-model"
              className="mb-1.5 block text-sm font-medium text-white"
            >
              Model
            </label>
            <select
              id="search-model"
              value={model}
              onChange={(e) => setModel(e.target.value)}
              disabled={!make}
              className={selectClasses + " disabled:cursor-not-allowed disabled:bg-gray-50 disabled:opacity-60"}
            >
              <option value="">All Models</option>
              {models.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>

          {/* Price Range */}
          <div className="flex-1">
            <label
              htmlFor="search-price"
              className="mb-1.5 block text-sm font-medium text-white"
            >
              Price Range
            </label>
            <select
              id="search-price"
              value={priceRange}
              onChange={(e) => setPriceRange(e.target.value)}
              className={selectClasses}
            >
              {priceRanges.map((range, i) => (
                <option key={i} value={i}>
                  {range.label}
                </option>
              ))}
            </select>
          </div>

          {/* Search button */}
          <div className="sm:flex-shrink-0">
            <button
              onClick={handleSearch}
              className="w-full rounded-lg bg-accent px-8 py-2.5 font-semibold text-white transition-colors duration-200 hover:bg-accent-dark focus:outline-none focus:ring-2 focus:ring-accent/50 focus:ring-offset-2 sm:w-auto"
            >
              Search
            </button>
          </div>
        </div>
      </Container>
    </section>
  );
}
