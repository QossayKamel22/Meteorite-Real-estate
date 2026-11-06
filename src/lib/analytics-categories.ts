// Shared by the analytics reader (analytics-data.ts) and the edge-middleware
// visit beacon (track-visit.ts), so it must stay free of server-only imports.

export const CATEGORY_KEYS = [
  "home",
  "aboutUs",
  "forSale",
  "forRent",
  "media",
  "contactUs",
  "propertyDetail",
  "other",
] as const;

export type CategoryKey = (typeof CATEGORY_KEYS)[number];

export function categorize(path: string): CategoryKey {
  if (path === "/") return "home";
  if (path.startsWith("/about-us")) return "aboutUs";
  if (path.startsWith("/property/")) return "propertyDetail";
  if (path.startsWith("/for-sale/")) return "propertyDetail";
  if (path.startsWith("/for-sale")) return "forSale";
  if (path.startsWith("/for-rent/")) return "propertyDetail";
  if (path.startsWith("/for-rent")) return "forRent";
  if (path.startsWith("/media")) return "media";
  if (path.startsWith("/contact-us")) return "contactUs";
  return "other";
}

/** Device class from the User-Agent, or "bot" for crawlers (those are not counted as visits). */
export function deviceOf(ua: string): "mobile" | "tablet" | "desktop" | "bot" {
  if (!ua) return "desktop";
  if (/bot|crawl|spider|slurp|headless|lighthouse|preview|facebookexternalhit|monitor|uptime/i.test(ua)) return "bot";
  if (/ipad|tablet|(android(?!.*mobile))/i.test(ua)) return "tablet";
  if (/mobi|iphone|ipod|android/i.test(ua)) return "mobile";
  return "desktop";
}

/** Extra per-visit counters kept on the running-totals document: device, hour of day (Dubai time) and page. */
export function detailDeltas(path: string, ua: string, now = new Date()): Record<string, number> | null {
  const dev = deviceOf(ua);
  if (dev === "bot") return null;
  const hour = String((now.getUTCHours() + 4) % 24).padStart(2, "0");
  const out: Record<string, number> = { [`dev_${dev}`]: 1, [`h${hour}`]: 1 };
  const prop = path.match(/^\/property\/([A-Za-z0-9_-]{1,40})\/?$/);
  if (prop) out[`pp_${prop[1].replace(/-/g, "_")}`] = 1;
  else {
    const slug = path.replace(/^\/|\/$/g, "").replace(/[^A-Za-z0-9]+/g, "_").slice(0, 40) || "home";
    out[`p_${slug}`] = 1;
  }
  return out;
}
