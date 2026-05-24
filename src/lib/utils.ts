export function formatPrice(price: number): string {
  return new Intl.NumberFormat("en-NZ", {
    style: "currency",
    currency: "NZD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}

export function formatMileage(km: number): string {
  return new Intl.NumberFormat("en-NZ").format(km) + " km";
}

export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(" ");
}

export function slugify(text: string): string {
  return text.toLowerCase().replace(/\s+/g, "-").replace(/[^\w-]+/g, "");
}

/**
 * Turn a human-readable phone number ("020 4190 7335", "+64 21 555 0000")
 * into a tap-to-call href ("tel:02041907335", "tel:+64215550000").
 * Returns "" if the input has no digits, so callers can avoid rendering
 * a broken anchor.
 */
export function toTelHref(phone: string): string {
  const digits = (phone ?? "").replace(/[^\d+]/g, "");
  return digits ? `tel:${digits}` : "";
}
