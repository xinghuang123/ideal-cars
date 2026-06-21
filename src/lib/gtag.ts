// Google Ads (gtag.js) configuration and helpers.

/** Google Ads tag / Conversion ID. */
export const GOOGLE_ADS_ID = "AW-18250652231";

/** `send_to` value for the Contact form-submission conversion. */
export const CONTACT_CONVERSION_SEND_TO = `${GOOGLE_ADS_ID}/bKE3CJzP0sIcEMe0y_5D`;

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

/** Fire a Google Ads conversion event. No-op if the tag has not loaded. */
export function reportConversion(sendTo: string) {
  if (typeof window !== "undefined" && typeof window.gtag === "function") {
    window.gtag("event", "conversion", { send_to: sendTo });
  }
}
