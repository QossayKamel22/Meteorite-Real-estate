import "server-only";
import { getDoc, setDocMerge } from "@/lib/firestore-rest";
import { DEFAULT_POSTERS, isPosterSrc, type Poster } from "@/lib/poster-series-shared";

const COLLECTION = "settings";
const DOC_ID = "poster-series";

export async function getPosterSeries(): Promise<Poster[]> {
  const doc = await getDoc(COLLECTION, DOC_ID);
  const items = (doc?.data as { items?: unknown } | undefined)?.items;
  if (!Array.isArray(items)) return DEFAULT_POSTERS;
  const list = items
    .map((i) => ({ src: String((i as Poster)?.src ?? ""), alt: String((i as Poster)?.alt ?? "") }))
    .filter((p) => isPosterSrc(p.src));
  return list;
}

export async function savePosterSeries(items: Poster[]): Promise<void> {
  await setDocMerge(COLLECTION, DOC_ID, { items, updatedAt: new Date().toISOString() });
}
