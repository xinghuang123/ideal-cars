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
  cin?: ConsumerInformationNotice;
  bcg?: BasicConditionGuide;
}

/* ---- Consumer Information Notice (CIN) ---- */
export interface CinTraderInfo {
  name: string;
  address: string;
  isRegisteredTrader: boolean;
  traderRegistrationNumber: string;
  phone?: string;
  contactPerson?: string;
}

export interface ConsumerInformationNotice {
  // Trader info
  trader: CinTraderInfo;
  // Sale information
  cashPrice: number;
  securityInterest: string;
  // Vehicle identification
  engineCapacityCc: number;
  odometer: number;
  odometerUnit: "km" | "miles";
  hasRadio88to108: boolean;
  vin: string;
  // WoF / CoF
  hasWofOrCof: boolean;
  wofOrCofExpiry: string;
  // Vehicle licence
  hasVehicleLicence: boolean;
  vehicleLicenceExpiry: string;
  // Registration
  isRegistered: boolean;
  regoPlate: string;
  nzFirstRegistered: string;
  isReregistered: boolean;
  // Fuel & RUC
  operatingFuelType: string;
  rucApplies: boolean;
  outstandingRuc: boolean;
  // Import information
  overseasFirstRegistered: string;
  countryLastRegistered: string;
  importedAsDamaged: boolean;
}

/* ---- Basic Condition Guide (BCG) ---- */
export type BcgItemStatus = "OK" | "Requires Attention" | "N/A";

export type BcgCategory =
  | "Engine"
  | "Transmission"
  | "Brakes"
  | "Tyres"
  | "Suspension"
  | "Air Conditioning / Heater"
  | "Electrical / Accessories";

export interface BcgChecklistItem {
  category: BcgCategory;
  item: string;
  status: BcgItemStatus;
  comment?: string;
}

export interface TyreDepths {
  frontLeft: number;
  frontRight: number;
  rearLeft: number;
  rearRight: number;
  spare?: number;
}

export interface BasicConditionGuide {
  inspectionDate: string;
  inspectorName: string;
  publisherName: string;
  checklist: BcgChecklistItem[];
  tyreDepths: TyreDepths;
  interiorCondition: {
    seats: string;
    carpets: string;
    panels: string;
    dashboard: string;
  };
  bodyComments: string;
  underCarriageComments: string;
  generalComments: string;
  roadConditions: string;
  bodyConditions: string;
  engineTimingMechanism: string;
  camBeltReplaced: boolean | null;
  camBeltReplacedKms: number | null;
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
