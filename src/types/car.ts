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
export interface ConsumerInformationNotice {
  securityInterest: string;
  regoPlate: string;
  hasRadio88to108: boolean;
  nzFirstRegistered: string;
  isReregistered: boolean;
  rucApplies: boolean;
  outstandingRuc: boolean;
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
