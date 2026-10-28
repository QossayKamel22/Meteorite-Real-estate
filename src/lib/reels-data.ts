import "server-only";
import { addDoc, commitWrites, deleteDoc, getDoc, listCollection, setDocMerge } from "@/lib/firestore-rest";
import { MAX_REELS, autoCover, parseReelUrl, type Reel, type ReelPlatform } from "@/lib/reels-shared";

const COLLECTION = "reels";
const SEED_MARKER_COLLECTION = "_meta";
const SEED_MARKER_ID = "reelsSeeded";

/** The first two reels, from the company's TikTok page (@meteorite.real.es). Created once, then fully editable. */
const SEED: { url: string; title: string }[] = [
  { url: "https://www.tiktok.com/@meteorite.real.es/video/7701700031061003541", title: "Meteorite Real Estate on TikTok" },
  { url: "https://www.tiktok.com/@meteorite.real.es/video/7701007988298992917", title: "Meteorite Real Estate on TikTok" },
];

let seedConfirmed = false;

async function seedIfEmpty(): Promise<void> {
  if (seedConfirmed) return;
  const marker = await getDoc(SEED_MARKER_COLLECTION, SEED_MARKER_ID);
  if (marker) {
    seedConfirmed = true;
    return;
  }
  await commitWrites([
    { collection: SEED_MARKER_COLLECTION, id: SEED_MARKER_ID, data: { seededAt: new Date().toISOString() }, requireAbsent: true },
    ...SEED.map((s, i) => ({
      collection: COLLECTION,
      id: crypto.randomUUID(),
      data: { platform: "tiktok", url: s.url, title: s.title, cover: "", visible: true, order: i },
      requireAbsent: true,
    })),
  ]);
}

function toReel(id: string, d: Record<string, unknown>): Reel | null {
  const url = typeof d.url === "string" ? d.url : "";
  const p = parseReelUrl(url);
  if (!p.ok) return null; // a corrupt entry is skipped, never rendered
  const cover = typeof d.cover === "string" && d.cover ? d.cover : autoCover(p.platform, p.url);
  return {
    id,
    platform: p.platform as ReelPlatform,
    url: p.url,
    title: typeof d.title === "string" ? d.title : "",
    cover,
    visible: typeof d.visible === "boolean" ? d.visible : true,
    order: typeof d.order === "number" ? d.order : 0,
  };
}

/** Public callers get visible reels only, in order. The admin passes includeHidden. */
export async function getReels(opts?: { includeHidden?: boolean }): Promise<Reel[]> {
  await seedIfEmpty();
  const docs = await listCollection(COLLECTION, { orderBy: "order" });
  const all = docs.map((d) => toReel(d.id, d.data)).filter((r): r is Reel => r !== null);
  return opts?.includeHidden ? all : all.filter((r) => r.visible);
}

export async function addReel(input: { url: string; platform: ReelPlatform; title: string; cover: string; visible: boolean }): Promise<string> {
  const existing = await listCollection(COLLECTION, { orderBy: "order" });
  if (existing.length >= MAX_REELS) throw new Error(`You can have up to ${MAX_REELS} reels.`);
  const last = existing.reduce((m, d) => Math.max(m, typeof d.data.order === "number" ? d.data.order : 0), -1);
  return addDoc(COLLECTION, { ...input, order: last + 1 });
}

export async function updateReel(id: string, patch: Partial<{ title: string; cover: string; visible: boolean }>): Promise<void> {
  await setDocMerge(COLLECTION, id, { ...patch, updatedAt: new Date().toISOString() });
}

export async function deleteReel(id: string): Promise<void> {
  await deleteDoc(COLLECTION, id);
}

/** Swaps this reel's position with its neighbour. Only `order` is written. */
export async function moveReel(id: string, direction: "up" | "down"): Promise<void> {
  const docs = await listCollection(COLLECTION, { orderBy: "order" });
  const idx = docs.findIndex((d) => d.id === id);
  const j = direction === "up" ? idx - 1 : idx + 1;
  if (idx === -1 || j < 0 || j >= docs.length) return;
  const a = docs[idx];
  const b = docs[j];
  const oa = typeof a.data.order === "number" ? a.data.order : idx;
  const ob = typeof b.data.order === "number" ? b.data.order : j;
  await commitWrites([
    { collection: COLLECTION, id: a.id, data: { order: ob }, mergeFields: ["order"] },
    { collection: COLLECTION, id: b.id, data: { order: oa }, mergeFields: ["order"] },
  ]);
}
