export interface Car {
  id: string;
  make: string;
  model: string;
  year: number;
  price: number;
  mileage: number;
  fuelType: "Petrol" | "Diesel" | "Hybrid" | "Electric";
  transmission: "Automatic" | "Manual";
  bodyType: string;
  engineSize: string;
  colour: string;
  doors: number;
  seats: number;
  driveType: string;
  images: string[];
  features: string[];
  description: string;
  status: "available" | "sold" | "special";
  wofExpiry: string;
  regoExpiry: string;
  vin?: string;
  stockNumber: string;
}

export interface CarFilters {
  make?: string;
  model?: string;
  yearMin?: number;
  yearMax?: number;
  priceMin?: number;
  priceMax?: number;
  fuelType?: string;
  transmission?: string;
  bodyType?: string;
  sortBy?: "price-asc" | "price-desc" | "year-desc" | "year-asc" | "mileage-asc";
}
