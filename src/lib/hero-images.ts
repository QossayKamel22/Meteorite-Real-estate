import "server-only";
import { getDoc, setDocMerge } from "@/lib/firestore-rest";
import { DEFAULT_HERO_IMAGES, isHeroSrc, type HeroImage } from "@/lib/hero-images-shared";

const COLLECTION = "settings";
const DOC_ID = "hero-images";

export async function getHeroImages(): Promise<HeroImage[]> {
  const doc = await getDoc(COLLECTION, DOC_ID);
  const items = (doc?.data as { items?: unknown } | undefined)?.items;
  if (!Array.isArray(items)) return DEFAULT_HERO_IMAGES;
  const list = items
    .map((i) => ({ src: String((i as HeroImage)?.src ?? ""), alt: String((i as HeroImage)?.alt ?? "") }))
    .filter((p) => isHeroSrc(p.src));
  // An empty saved list falls back to the defaults: the hero is never left without a picture.
  return list.length > 0 ? list : DEFAULT_HERO_IMAGES;
}

export async function saveHeroImages(items: HeroImage[]): Promise<void> {
  await setDocMerge(COLLECTION, DOC_ID, { items, updatedAt: new Date().toISOString() });
}
