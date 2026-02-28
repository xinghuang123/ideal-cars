export interface Service {
  id: string;
  title: string;
  description: string;
  icon: string;
  features: string[];
}

export const services: Service[] = [
  {
    id: "wof",
    title: "Warrant of Fitness",
    description:
      "Get your WOF inspection done quickly and efficiently. We are NZTA-approved inspectors ensuring your vehicle meets all safety requirements.",
    icon: "shield-check",
    features: [
      "NZTA-approved inspection",
      "Quick turnaround",
      "Detailed report provided",
      "Re-inspection included",
    ],
  },
  {
    id: "servicing",
    title: "Vehicle Servicing",
    description:
      "Regular servicing keeps your car running at its best. We service all makes and models with genuine or quality aftermarket parts.",
    icon: "wrench",
    features: [
      "Full & interim services",
      "All makes and models",
      "Genuine parts available",
      "Service book stamped",
    ],
  },
  {
    id: "repairs",
    title: "Mechanical Repairs",
    description:
      "From minor fixes to major mechanical repairs, our experienced mechanics can diagnose and fix any issue with your vehicle.",
    icon: "cog",
    features: [
      "Engine & transmission",
      "Brakes & suspension",
      "Electrical diagnostics",
      "Free quotes available",
    ],
  },
  {
    id: "tyres",
    title: "Tyres & Alignment",
    description:
      "New tyres, wheel alignments, balancing, and puncture repairs. We stock a wide range of tyres for all budgets.",
    icon: "circle",
    features: [
      "New & quality used tyres",
      "Wheel alignment",
      "Tyre balancing",
      "Puncture repairs",
    ],
  },
  {
    id: "preinspection",
    title: "Pre-Purchase Inspection",
    description:
      "Thinking of buying a car? Let us inspect it first. Our thorough pre-purchase inspection gives you peace of mind.",
    icon: "search",
    features: [
      "Comprehensive 100+ point check",
      "Written report",
      "Mechanical & structural",
      "Peace of mind",
    ],
  },
  {
    id: "electrical",
    title: "Auto Electrical",
    description:
      "Specialised auto electrical services including diagnostics, wiring repairs, battery replacement, and accessory installation.",
    icon: "zap",
    features: [
      "Computer diagnostics",
      "Battery testing & replacement",
      "Wiring repairs",
      "Accessory installation",
    ],
  },
];
