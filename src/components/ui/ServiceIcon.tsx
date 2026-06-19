import Image from "next/image";
import type { ReactNode } from "react";

// Built-in icon set for service cards. Keys are stored in services.icon.
// Glyphs are simple stroked SVGs in the project's existing inline-SVG style
// (24x24 viewBox, stroke=currentColor) so they inherit the accent colour.
const ICON_PATHS: Record<string, ReactNode> = {
  "shield-check": (
    <>
      <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
      <path d="m9 12 2 2 4-4" />
    </>
  ),
  wrench: (
    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
  ),
  cog: (
    <>
      <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
      <circle cx="12" cy="12" r="3" />
    </>
  ),
  car: (
    <>
      <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.5 2.8C1.4 11 1 11.7 1 12.5V16c0 .6.4 1 1 1h2" />
      <circle cx="7" cy="17" r="2" />
      <path d="M9 17h6" />
      <circle cx="17" cy="17" r="2" />
    </>
  ),
  gauge: (
    <>
      <path d="m12 14 4-4" />
      <path d="M3.34 19a10 10 0 1 1 17.32 0" />
    </>
  ),
  disc: (
    <>
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="2" />
    </>
  ),
  droplet: (
    <path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z" />
  ),
  zap: (
    <path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z" />
  ),
  battery: (
    <>
      <rect width="16" height="10" x="2" y="7" rx="2" ry="2" />
      <line x1="22" x2="22" y1="11" y2="13" />
    </>
  ),
  search: (
    <>
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </>
  ),
  "clipboard-check": (
    <>
      <rect width="8" height="4" x="8" y="2" rx="1" ry="1" />
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
      <path d="m9 14 2 2 4-4" />
    </>
  ),
  circle: <circle cx="12" cy="12" r="10" />,
};

const DEFAULT_ICON = "wrench";

/** Options for the admin icon dropdown, in display order. */
export const SERVICE_ICON_OPTIONS: { value: string; label: string }[] = [
  { value: "shield-check", label: "Shield (WOF / safety)" },
  { value: "wrench", label: "Wrench (servicing)" },
  { value: "cog", label: "Cog (mechanical)" },
  { value: "car", label: "Car" },
  { value: "gauge", label: "Gauge (diagnostics)" },
  { value: "disc", label: "Disc (brakes / tyres)" },
  { value: "droplet", label: "Droplet (oil / fluids)" },
  { value: "zap", label: "Lightning (electrical)" },
  { value: "battery", label: "Battery" },
  { value: "search", label: "Search (inspection)" },
  { value: "clipboard-check", label: "Clipboard (reports)" },
  { value: "circle", label: "Circle (generic)" },
];

/** The raw SVG glyph for a given icon key (falls back to a wrench). */
export function ServiceIconGlyph({
  icon,
  className = "h-6 w-6",
}: {
  icon: string | null | undefined;
  className?: string;
}) {
  const glyph = (icon && ICON_PATHS[icon]) || ICON_PATHS[DEFAULT_ICON];
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {glyph}
    </svg>
  );
}

/**
 * The full icon badge used on service cards. Shows the uploaded image when
 * `imageUrl` is set, otherwise the built-in SVG glyph on the accent tint.
 */
export function ServiceIconBadge({
  icon,
  imageUrl,
  className = "h-12 w-12",
  glyphClassName = "h-6 w-6",
}: {
  icon: string | null | undefined;
  imageUrl?: string | null;
  className?: string;
  glyphClassName?: string;
}) {
  if (imageUrl) {
    return (
      <div className={`relative overflow-hidden rounded-lg bg-white ${className}`}>
        <Image src={imageUrl} alt="" fill className="object-cover" sizes="64px" />
      </div>
    );
  }
  return (
    <div
      className={`flex items-center justify-center rounded-lg bg-accent/10 text-accent ${className}`}
    >
      <ServiceIconGlyph icon={icon} className={glyphClassName} />
    </div>
  );
}
