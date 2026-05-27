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
};
