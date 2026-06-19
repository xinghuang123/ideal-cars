import type {
  ConsumerInformationNotice,
  BasicConditionGuide,
} from "@/types/car";

export type VehicleStatus = "available" | "sold" | "special";
export type FuelType = "Petrol" | "Diesel" | "Hybrid" | "Electric";
export type TransmissionType = "Automatic" | "Manual";
export type BodyType = "Sedan" | "Hatchback" | "SUV" | "Ute" | "Wagon" | "Coupe" | "Van";
export type EnquirySubject =
  | "General Inquiry"
  | "Buy a Car"
  | "Sell a Car"
  | "Finance"
  | "Service"
  | "Other";
export type SellCondition = "Excellent" | "Good" | "Fair" | "Poor";
export type EnquiryStatus = "new" | "read" | "replied" | "archived";

export interface VehicleRow {
  id: string;
  stock_number: string;
  make: string;
  model: string;
  year: number;
  price: number;
  mileage: number;
  fuel_type: FuelType;
  transmission: TransmissionType;
  body_type: BodyType;
  engine_size: string | null;
  colour: string;
  doors: number | null;
  seats: number | null;
  drive_type: string | null;
  features: string[];
  description: string | null;
  status: VehicleStatus;
  published: boolean;
  wof_expiry: string | null;
  rego_expiry: string | null;
  vin: string | null;
  cin: ConsumerInformationNotice | null;
  bcg: BasicConditionGuide | null;
  created_at: string;
  updated_at: string;
}

export interface VehicleImageRow {
  id: string;
  vehicle_id: string;
  image_url: string;
  display_order: number;
  is_primary: boolean;
  created_at: string;
}

export interface ContactEnquiryInsert {
  name: string;
  email: string;
  phone: string;
  subject: EnquirySubject;
  message: string;
}

export interface SellCarEnquiryInsert {
  name: string;
  email: string;
  phone: string;
  make: string;
  model: string;
  year: number;
  mileage: number;
  fuel_type: FuelType;
  transmission: TransmissionType;
  condition: SellCondition;
  description?: string | null;
  expected_price?: number | null;
}

export interface VehicleEnquiryInsert {
  vehicle_id?: string | null;
  name: string;
  email: string;
  phone: string;
  message?: string | null;
}

export interface FinanceApplicationInsert {
  vehicle_id?: string | null;
  name: string;
  email: string;
  phone: string;
  employment_status?: string | null;
  annual_income?: number | null;
  deposit_amount?: number | null;
  loan_term_years?: number | null;
  message?: string | null;
}

export interface ServiceRow {
  id: string;
  title: string;
  description: string;
  icon: string | null;
  icon_image_url: string | null;
  features: string[];
  display_order: number;
  is_active: boolean;
}

export interface HeroSlideRow {
  id: string;
  image_url: string | null;
  heading: string;
  subheading: string;
  button_text: string;
  button_href: string;
  gradient_class: string | null;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface AboutValueRow {
  id: string;
  title: string;
  description: string;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface AboutTeamMemberRow {
  id: string;
  name: string;
  role: string;
  bio: string;
  photo_url: string | null;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface FinanceBenefitRow {
  id: string;
  icon: string;
  title: string;
  description: string;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface FinanceFaqRow {
  id: string;
  question: string;
  answer: string;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}
