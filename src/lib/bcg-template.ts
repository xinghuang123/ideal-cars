import type { BcgChecklistItem } from "@/types/car";

export const STANDARD_BCG_CHECKLIST: ReadonlyArray<{
  category: BcgChecklistItem["category"];
  item: string;
}> = [
  { category: "Engine", item: "Oil level" },
  { category: "Engine", item: "Smoke & fumes" },
  { category: "Engine", item: "Engine performance" },
  { category: "Engine", item: "Noise" },
  { category: "Engine", item: "Coolant condition" },
  { category: "Engine", item: "Cooling performance" },
  { category: "Engine", item: "Radiator / Hoses (visual)" },
  { category: "Transmission", item: "Operation" },
  { category: "Transmission", item: "Noise" },
  { category: "Transmission", item: "Clutch" },
  { category: "Transmission", item: "CV joints" },
  { category: "Transmission", item: "Wheel bearings" },
  { category: "Brakes", item: "Performance" },
  { category: "Brakes", item: "Hand brake" },
  { category: "Suspension", item: "Suspension performance" },
  { category: "Suspension", item: "Steering performance" },
  { category: "Suspension", item: "Shock absorbers" },
  { category: "Air Conditioning / Heater", item: "Operation" },
  { category: "Electrical / Accessories", item: "Head lights" },
  { category: "Electrical / Accessories", item: "Tail lights" },
  { category: "Electrical / Accessories", item: "Indicators" },
  { category: "Electrical / Accessories", item: "Dashboard warning lights" },
  { category: "Electrical / Accessories", item: "Wipers (front & rear)" },
  { category: "Electrical / Accessories", item: "Window winder FL" },
  { category: "Electrical / Accessories", item: "Window winder FR" },
  { category: "Electrical / Accessories", item: "Window winder RL" },
  { category: "Electrical / Accessories", item: "Window winder RR" },
  { category: "Electrical / Accessories", item: "Rear view mirrors" },
  { category: "Electrical / Accessories", item: "Radio (basic test only)" },
  { category: "Electrical / Accessories", item: "Number of keys" },
  { category: "Electrical / Accessories", item: "Central locking" },
  { category: "Electrical / Accessories", item: "Remote locking" },
  { category: "Electrical / Accessories", item: "Reversing camera" },
];

export const DEFAULT_TRADER = {
  name: "Ideal Cars Limited",
  address: "64 Broad Street, Woolston, Christchurch 8062",
  isRegisteredTrader: true,
  traderRegistrationNumber: "MV123456",
  phone: "020 4190 7335",
  contactPerson: "Johnie Moore",
};
