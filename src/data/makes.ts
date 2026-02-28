export const carMakes = [
  "Toyota",
  "Mazda",
  "Ford",
  "Honda",
  "Nissan",
  "Mitsubishi",
  "Suzuki",
  "Hyundai",
  "Kia",
  "Subaru",
  "BMW",
  "Mercedes-Benz",
  "Volkswagen",
] as const;

export const carModels: Record<string, string[]> = {
  Toyota: ["Corolla", "Camry", "RAV4", "Hilux", "Yaris", "Aqua", "C-HR"],
  Mazda: ["Mazda3", "Mazda6", "CX-5", "CX-3", "Mazda2", "BT-50"],
  Ford: ["Ranger", "Focus", "Fiesta", "Escape", "Everest", "Mondeo"],
  Honda: ["Civic", "Fit", "HR-V", "CR-V", "Jazz", "Accord"],
  Nissan: ["X-Trail", "Qashqai", "Navara", "Note", "Leaf", "Juke"],
  Mitsubishi: ["Outlander", "ASX", "Triton", "Eclipse Cross", "Lancer"],
  Suzuki: ["Swift", "Vitara", "Jimny", "Ignis", "S-Cross", "Baleno"],
  Hyundai: ["Tucson", "Kona", "i30", "Santa Fe", "Venue", "Ioniq"],
  Kia: ["Sportage", "Seltos", "Cerato", "Sorento", "Niro", "Stonic"],
  Subaru: ["Outback", "Forester", "XV", "Impreza", "Legacy", "WRX"],
  BMW: ["3 Series", "X1", "X3", "1 Series", "5 Series", "X5"],
  "Mercedes-Benz": ["A-Class", "C-Class", "GLA", "GLC", "E-Class", "CLA"],
  Volkswagen: ["Golf", "Tiguan", "Polo", "T-Cross", "Touareg", "Passat"],
};

export const bodyTypes = [
  "Sedan",
  "Hatchback",
  "SUV",
  "Ute",
  "Wagon",
  "Coupe",
  "Van",
] as const;

export const fuelTypes = ["Petrol", "Diesel", "Hybrid", "Electric"] as const;

export const transmissionTypes = ["Automatic", "Manual"] as const;
