"use server";

import { createClient } from "@/lib/supabase/server";

/**
 * CarJam vehicle lookup (https://www.carjam.co.nz/dev:page?t=vehicle-queries).
 * GET {base}?plate=...&key=...&basic=1&f=json — errors come back as HTTP 200
 * with {"class":"apperror","message":"..."}.
 */

export interface PlateLookupResult {
  make?: string;
  model?: string;
  year?: number;
  vin?: string;
  bodyStyle?: string;
  fuelType?: string;
  transmission?: string;
  engineSize?: string;
  colour?: string;
  seats?: number;
  wofExpiry?: string;
  regoExpiry?: string;
}

type Raw = Record<string, unknown>;

function str(v: unknown): string | undefined {
  if (v === null || v === undefined) return undefined;
  const s = String(v).trim();
  return s ? s : undefined;
}

function num(v: unknown): number | undefined {
  const s = str(v);
  if (!s) return undefined;
  const n = Number(s);
  return Number.isFinite(n) ? n : undefined;
}

/** CarJam dates may be unix seconds, YYYYMMDD, or YYYY-MM-DD. → YYYY-MM-DD */
function toIsoDate(v: unknown): string | undefined {
  const s = str(v);
  if (!s) return undefined;
  if (/^\d{4}-\d{2}-\d{2}/.test(s)) return s.slice(0, 10);
  if (/^\d{8}$/.test(s)) return `${s.slice(0, 4)}-${s.slice(4, 6)}-${s.slice(6, 8)}`;
  if (/^\d{9,11}$/.test(s)) {
    const d = new Date(Number(s) * 1000);
    if (!Number.isNaN(d.getTime())) return d.toISOString().slice(0, 10);
  }
  return undefined;
}

function normalizeFuel(v: unknown): string | undefined {
  const s = str(v)?.toLowerCase();
  if (!s) return undefined;
  if (s.includes("hybrid") || s.includes("phev")) return "Hybrid";
  if (s.includes("electric") || s.includes("ev")) return "Electric";
  if (s.includes("diesel")) return "Diesel";
  if (s.includes("petrol") || s.includes("gasoline")) return "Petrol";
  return undefined;
}

function normalizeTransmission(v: unknown): string | undefined {
  const s = str(v)?.toLowerCase();
  if (!s) return undefined;
  if (s.includes("man")) return "Manual";
  if (s.includes("auto") || s.includes("cvt") || s.includes("dsg")) return "Automatic";
  return undefined;
}

function normalizeBodyStyle(v: unknown): string | undefined {
  const s = str(v)?.toLowerCase();
  if (!s) return undefined;
  if (s.includes("saloon") || s.includes("sedan")) return "Sedan";
  if (s.includes("hatch")) return "Hatchback";
  if (s.includes("station") || s.includes("wagon")) return "Wagon";
  if (s.includes("sports utility") || s.includes("suv") || s.includes("4x4")) return "SUV";
  if (s.includes("ute") || s.includes("utility") || s.includes("pick")) return "Ute";
  if (s.includes("coupe")) return "Coupe";
  if (s.includes("van") || s.includes("bus")) return "Van";
  return undefined;
}

/** Title-case an ALL-CAPS CarJam value: "TOYOTA" → "Toyota". */
function titleCase(v: unknown): string | undefined {
  const s = str(v);
  if (!s) return undefined;
  return s
    .toLowerCase()
    .replace(/(^|[\s-])([a-z])/g, (_, sep, ch) => sep + ch.toUpperCase());
}

export async function lookupPlate(
  plate: string,
): Promise<{ data?: PlateLookupResult; error?: string }> {
  const cleaned = plate.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
  if (!cleaned || cleaned.length > 8) {
    return { error: "Enter a valid NZ number plate." };
  }

  // Only admins may spend CarJam credits.
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const role = (user?.app_metadata as Record<string, unknown> | undefined)?.role;
  if (!user || role !== "admin") {
    return { error: "Session expired — please sign in again." };
  }

  const key = process.env.CARJAM_API_KEY;
  if (!key) {
    return {
      error:
        "CarJam is not configured yet — add CARJAM_API_KEY to the environment variables.",
    };
  }
  const base = process.env.CARJAM_API_BASE ?? "https://www.carjam.co.nz/api/car/";

  let json: Raw;
  try {
    const url = `${base}?plate=${encodeURIComponent(cleaned)}&key=${encodeURIComponent(key)}&basic=1&f=json`;
    const res = await fetch(url, { cache: "no-store" });
    json = (await res.json()) as Raw;
  } catch (err) {
    console.error("[carjam] lookup failed", err);
    return { error: "Could not reach CarJam — try again shortly." };
  }

  if (json.class === "apperror" || json.error) {
    const msg = str(json.message) ?? str(json.error) ?? "Lookup failed";
    return { error: `CarJam: ${msg}` };
  }

  // The vehicle block location varies by report; merge the likely candidates.
  const idh = (json.idh ?? {}) as Raw;
  const v: Raw = {
    ...(json as Raw),
    ...((json.vehicle ?? {}) as Raw),
    ...idh,
    ...((idh.vehicle ?? {}) as Raw),
  };

  const cc = num(v.cc_rating);
  const data: PlateLookupResult = {
    make: titleCase(v.make),
    model: titleCase(v.model),
    year: num(v.year_of_manufacture),
    vin: str(v.vin)?.toUpperCase(),
    bodyStyle: normalizeBodyStyle(v.body_style),
    fuelType: normalizeFuel(v.fuel_type),
    transmission: normalizeTransmission(v.transmission),
    engineSize: cc ? `${(Math.round(cc / 100) / 10).toFixed(1)}L` : undefined,
    colour: titleCase(v.main_colour ?? v.colour ?? v.basic_colour),
    seats: num(v.number_of_seats ?? v.no_of_seats),
    wofExpiry: toIsoDate(v.expiry_date_of_last_successful_wof),
    regoExpiry: toIsoDate(v.licence_expiry_date ?? v.expiry_date_of_licence),
  };

  const found = Object.values(data).filter((x) => x !== undefined).length;
  if (found === 0) {
    return { error: "CarJam returned no vehicle details for that plate." };
  }
  return { data };
}
