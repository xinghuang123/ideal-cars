// Pure constants for site_content. Safe to import from client components
// (no server-only deps).

export interface SiteContent {
  phone: string;
  email: string;
  address: string;
  hours_weekday: string;
  hours_saturday: string;
  hours_sunday: string;
  tagline: string;
  hero_title: string;
  hero_subtitle: string;
  about_intro: string;
  our_story_body: string;
  page_finance_subtitle: string;
  finance_benefits_heading: string;
  finance_benefits_subtitle: string;
  finance_calculator_heading: string;
  finance_calculator_subtitle: string;
  finance_apply_heading: string;
  finance_apply_subtitle: string;
  finance_faq_heading: string;
  finance_faq_subtitle: string;
  page_service_subtitle: string;
  service_intro_heading: string;
  service_intro_subtitle: string;
  service_cta_heading: string;
  service_cta_body: string;
  service_cta_button_text: string;
  facebook_url: string;
  instagram_url: string;
  x_url: string;
  youtube_url: string;
  tiktok_url: string;
  trader_registration_number: string;
  stat_1_value: string;
  stat_1_label: string;
  stat_2_value: string;
  stat_2_label: string;
  stat_3_value: string;
  stat_3_label: string;
  stat_4_value: string;
  stat_4_label: string;
  [key: string]: string;
}

export const DEFAULTS: SiteContent = {
  phone: "020 4190 7335",
  email: "idealcarsnzltd@gmail.com",
  address: "64 Broad Street, Woolston, Christchurch 8062",
  hours_weekday: "Monday – Friday: 9:00 AM – 6:00 PM",
  hours_saturday: "Saturday: 10:00 AM – 4:00 PM",
  hours_sunday: "Sunday: Closed",
  tagline: "Your trusted car dealer in New Zealand",
  hero_title: "Find Your Ideal Car",
  hero_subtitle: "Browse our quality selection of second-hand vehicles",
  about_intro:
    "Ideal Cars is a family-owned used car dealership in Christchurch, New Zealand. We've been helping Kiwis find quality second-hand vehicles at fair prices since 2018.",
  our_story_body:
    "What started as a small yard with a handful of vehicles has grown into a full-service dealership offering quality used cars, vehicle finance, servicing, and repairs. Despite our growth, we have never lost sight of what matters most - putting our customers first and delivering genuine value. Whether you are buying your first car or upgrading your family vehicle, our friendly team is here to help every step of the way.",
  page_finance_subtitle:
    "Flexible finance solutions to get you on the road sooner.",
  finance_benefits_heading: "Why Finance With Us",
  finance_benefits_subtitle:
    "We make car finance simple, transparent, and accessible.",
  finance_calculator_heading: "Finance Calculator",
  finance_calculator_subtitle:
    "Use our calculator to estimate your weekly and monthly repayments.",
  finance_apply_heading: "Apply for Finance",
  finance_apply_subtitle:
    "Pre-approval is fast and obligation-free. We'll be in touch within one business day.",
  finance_faq_heading: "Frequently Asked Questions",
  finance_faq_subtitle: "Common questions about car finance answered.",
  page_service_subtitle:
    "Professional vehicle servicing and repairs by experienced mechanics.",
  service_intro_heading: "Our Services",
  service_intro_subtitle:
    "From routine maintenance to complex repairs, our qualified mechanics keep your vehicle running at its best.",
  service_cta_heading: "Ready to Book a Service?",
  service_cta_body:
    "Get in touch with our team to schedule your next service or repair. We offer competitive pricing and quality workmanship.",
  service_cta_button_text: "Book a Service",
  facebook_url: "",
  instagram_url: "",
  x_url: "",
  youtube_url: "",
  tiktok_url: "",
  trader_registration_number: "M051177",
  stat_1_value: "500+",
  stat_1_label: "Cars Sold",
  stat_2_value: "10+",
  stat_2_label: "Years Experience",
  stat_3_value: "4.8",
  stat_3_label: "Star Rating",
  stat_4_value: "100%",
  stat_4_label: "NZ Owned",
};

export const SITE_CONTENT_KEYS = Object.keys(DEFAULTS) as (keyof SiteContent)[];

export const FIELD_LABELS: Record<keyof SiteContent, { label: string; type: "text" | "textarea" }> = {
  phone: { label: "Phone number", type: "text" },
  email: { label: "Email", type: "text" },
  address: { label: "Address", type: "text" },
  hours_weekday: { label: "Hours — Mon–Fri", type: "text" },
  hours_saturday: { label: "Hours — Saturday", type: "text" },
  hours_sunday: { label: "Hours — Sunday", type: "text" },
  tagline: { label: "Footer tagline", type: "text" },
  hero_title: { label: "Homepage hero title", type: "text" },
  hero_subtitle: { label: "Homepage hero subtitle", type: "textarea" },
  about_intro: { label: "About page intro (first paragraph of Our Story)", type: "textarea" },
  our_story_body: { label: "Our Story body (further paragraphs, blank line between)", type: "textarea" },
  page_finance_subtitle: { label: "Finance page subtitle (under page title)", type: "text" },
  finance_benefits_heading: { label: "Finance — Benefits section heading", type: "text" },
  finance_benefits_subtitle: { label: "Finance — Benefits section subtitle", type: "text" },
  finance_calculator_heading: { label: "Finance — Calculator section heading", type: "text" },
  finance_calculator_subtitle: { label: "Finance — Calculator section subtitle", type: "text" },
  finance_apply_heading: { label: "Finance — Apply section heading", type: "text" },
  finance_apply_subtitle: { label: "Finance — Apply section subtitle", type: "textarea" },
  finance_faq_heading: { label: "Finance — FAQ section heading", type: "text" },
  finance_faq_subtitle: { label: "Finance — FAQ section subtitle", type: "text" },
  page_service_subtitle: { label: "Service page subtitle (under page title)", type: "text" },
  service_intro_heading: { label: "Service — Intro section heading", type: "text" },
  service_intro_subtitle: { label: "Service — Intro section subtitle", type: "textarea" },
  service_cta_heading: { label: "Service — CTA heading", type: "text" },
  service_cta_body: { label: "Service — CTA body", type: "textarea" },
  service_cta_button_text: { label: "Service — CTA button text", type: "text" },
  facebook_url: { label: "Facebook URL (leave blank to hide icon)", type: "text" },
  instagram_url: { label: "Instagram URL (leave blank to hide icon)", type: "text" },
  x_url: { label: "X / Twitter URL (leave blank to hide icon)", type: "text" },
  youtube_url: { label: "YouTube URL (leave blank to hide icon)", type: "text" },
  tiktok_url: { label: "TikTok URL (leave blank to hide icon)", type: "text" },
  trader_registration_number: {
    label: "Trader registration number (used on new CINs)",
    type: "text",
  },
  stat_1_value: { label: "Stat 1 — value (e.g. 500+)", type: "text" },
  stat_1_label: { label: "Stat 1 — label (e.g. Cars Sold)", type: "text" },
  stat_2_value: { label: "Stat 2 — value (e.g. 10+)", type: "text" },
  stat_2_label: { label: "Stat 2 — label (e.g. Years Experience)", type: "text" },
  stat_3_value: { label: "Stat 3 — value (e.g. 4.8)", type: "text" },
  stat_3_label: { label: "Stat 3 — label (e.g. Star Rating)", type: "text" },
  stat_4_value: { label: "Stat 4 — value (e.g. 100%)", type: "text" },
  stat_4_label: { label: "Stat 4 — label (e.g. NZ Owned)", type: "text" },
};
