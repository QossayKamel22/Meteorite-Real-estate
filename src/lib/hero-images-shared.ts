// Pure helpers (no server-only imports) shared by the admin form, the API and the unit tests.

export type HeroImage = { src: string; alt: string };

export const MAX_HERO_IMAGES = 8;

/** Dark, night-time pictures the hero starts with, until the admin saves a list of its own. */
export const DEFAULT_HERO_IMAGES: HeroImage[] = [
  { src: "/brand/hero-dubai-skyline.jpg", alt: "Dubai skyline at dusk" },
  { src: "/brand/binghatti/night-skyline.jpg", alt: "Towers lit up over Dubai at night" },
  { src: "/brand/binghatti/night-avenue.jpg", alt: "A Dubai avenue and tower at night" },
];

/** A hero picture is a bundled file or an image uploaded through the admin. */
export function isHeroSrc(v: string): boolean {
  return /^\/brand\/(?:binghatti\/)?[A-Za-z0-9._-]+\.(jpg|jpeg|png|webp)$/.test(v) || /^\/api\/img\/film\/[A-Za-z0-9_-]{1,64}$/.test(v);
}

export function parseHeroImages(input: unknown): { ok: true; value: HeroImage[] } | { ok: false; error: string } {
  const raw = (input as { items?: unknown } | null)?.items;
  if (!Array.isArray(raw)) return { ok: false, error: "Send the list of pictures." };
  if (raw.length > MAX_HERO_IMAGES) return { ok: false, error: `Up to ${MAX_HERO_IMAGES} pictures.` };
  const value: HeroImage[] = [];
  for (const item of raw) {
    const src = typeof (item as HeroImage)?.src === "string" ? (item as HeroImage).src.trim() : "";
    const alt = typeof (item as HeroImage)?.alt === "string" ? (item as HeroImage).alt.replace(/\s+/g, " ").trim().slice(0, 120) : "";
    if (!isHeroSrc(src)) return { ok: false, error: "Each picture must be an uploaded image." };
    value.push({ src, alt: alt || "Dubai" });
  }
  return { ok: true, value };
}
