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
  if (path.startsWith("/for-sale/")) return "propertyDetail";
  if (path.startsWith("/for-sale")) return "forSale";
  if (path.startsWith("/for-rent/")) return "propertyDetail";
  if (path.startsWith("/for-rent")) return "forRent";
  if (path.startsWith("/media")) return "media";
  if (path.startsWith("/contact-us")) return "contactUs";
  return "other";
}
