// Pure helpers (no server-only imports) so the admin form and the unit tests can share them.

export type Poster = { src: string; alt: string };

export const MAX_POSTERS = 12;
export const POSTER_ALT_MAX = 90;

/** The five posters the series launched with; used until the admin saves a list of its own. */
export const DEFAULT_POSTERS: Poster[] = [
  { src: "/brand/series/dubai-series-1.jpg", alt: "Waterfront living in Dubai Marina" },
  { src: "/brand/series/dubai-series-2.jpg", alt: "Luxury starts here: real estate expertise" },
  { src: "/brand/series/dubai-series-3.jpg", alt: "Live the Dubai dream" },
  { src: "/brand/series/dubai-series-4.jpg", alt: "Your next address in Dubai" },
  { src: "/brand/series/dubai-series-5.jpg", alt: "Invest with confidence: book a private viewing" },
];

/** A poster picture is either one of the bundled files or an image uploaded through the admin. */
export function isPosterSrc(v: string): boolean {
  return /^\/brand\/series\/[A-Za-z0-9._-]+\.(jpg|jpeg|png|webp)$/.test(v) || /^\/api\/img\/film\/[A-Za-z0-9_-]{1,64}$/.test(v);
}

export function parsePosters(input: unknown): { ok: true; value: Poster[] } | { ok: false; error: string } {
  const raw = (input as { items?: unknown } | null)?.items;
  if (!Array.isArray(raw)) return { ok: false, error: "Send the list of posters." };
  if (raw.length > MAX_POSTERS) return { ok: false, error: `Up to ${MAX_POSTERS} posters.` };
  const value: Poster[] = [];
  for (const item of raw) {
    const src = typeof (item as Poster)?.src === "string" ? (item as Poster).src.trim() : "";
    const alt = typeof (item as Poster)?.alt === "string" ? (item as Poster).alt.replace(/\s+/g, " ").trim() : "";
    if (!isPosterSrc(src)) return { ok: false, error: "Each poster must be an uploaded image." };
    if (alt.length > POSTER_ALT_MAX) return { ok: false, error: `A description must be ${POSTER_ALT_MAX} characters or fewer.` };
    value.push({ src, alt: alt || "Meteorite Real Estate poster" });
  }
  return { ok: true, value };
}
