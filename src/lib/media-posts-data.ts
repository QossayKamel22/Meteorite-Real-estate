import "server-only";
import { publicImageSrc } from "@/lib/image-url";
import { commitWrites, addDoc, deleteDoc, getDoc, listCollection, setDocMerge } from "@/lib/firestore-rest";
import { MAX_PINNED_POSTS } from "@/lib/media-posts-constants";

export { MAX_PINNED_POSTS };

const COLLECTION = "mediaPosts";

export type MediaPlatform = "instagram" | "facebook" | "twitter" | "youtube" | "other";

export type MediaPost = {
  id: string;
  /**
   * "social": a link out to an existing social media post.
   * "post": a native photo + text post hosted here.
   * "podcast": an Instagram/Facebook/X post embedded inline via its official widget (used for podcast episodes).
   */
  kind: "social" | "post" | "podcast";
  title: string;
  body?: string;
  image?: string;
  /** A direct video file URL (.mp4/.webm/.mov) or a YouTube link — rendered as a playable video. */
  video?: string;
  platform?: MediaPlatform;
  url?: string;
  /** Free-text grouping label for podcast episodes, so multiple podcast sections can exist (e.g. "Market Talk", "Client Stories"). Defaults to "Podcasts" when absent. */
  section?: string;
  /** Pinned posts (max 6, enforced by the admin API) show first, right after the podcast section(s). */
  pinned?: boolean;
  /** A tall (4:5) picture such as a poster: shown whole instead of cropped to a landscape frame. */
  portrait?: boolean;
  createdAt: string;
  /** Defaults to true when absent. */
  visible?: boolean;
};

export type MediaPostInput = Omit<MediaPost, "id" | "createdAt">;

function toMediaPost(id: string, data: Record<string, unknown>): MediaPost {
  return {
    id,
    kind: data.kind === "social" || data.kind === "podcast" ? data.kind : "post",
    title: data.title as string,
    body: data.body as string | undefined,
    image: data.image as string | undefined,
    video: data.video as string | undefined,
    platform: data.platform as MediaPlatform | undefined,
    url: data.url as string | undefined,
    section: data.section as string | undefined,
    pinned: data.pinned as boolean | undefined,
    portrait: data.portrait as boolean | undefined,
    createdAt: (data.createdAt as string) ?? new Date(0).toISOString(),
    visible: data.visible as boolean | undefined,
  };
}

// Posts can carry sizeable base64 image/video-poster fields. The public site
// only ever needs the most recent handful, so this caps how many documents
// (and their embedded image data) are fetched from Firestore and held in
// memory per request — otherwise the page's payload (and the Firestore read
// itself) grows without bound as more posts pile up over time.
const PUBLIC_FETCH_LIMIT = 60;

const SEED_POSTS: { id: string; marker: string; title: string; body: string; image: string; pinned?: boolean }[] = [
  { id: "poster-uae-flag-day", marker: "uaeFlagDay2026", title: "UAE Flag Day — 3 November", body: "The flag Sheikh Zayed raised will fly high, God willing. Happy Flag Day, UAE.", image: "/brand/posters/uae-flag-day.jpg", pinned: true },
  { id: "poster-saad-abdullah-soboh", marker: "teamPostersSeeded", title: "Meet our CEO — Saad Abdullah Soboh", body: "CEO and Founder of Meteorite Real Estate, an accredited RERA / Dubai Land Department broker.", image: "/brand/posters/saad-abdullah-soboh.jpg" },
  { id: "poster-meher-samir-zamily", marker: "teamPostersSeeded-meher", title: "Meet our team — Meher Samir M Zamily", body: "Sales Manager: selling, buying (ready and off-plan property) and leasing.", image: "/brand/posters/meher-samir-zamily.jpg" },
];
let postersSeeded = false;

/** Each team poster is added once (tracked by its own marker); after that it is an ordinary post the admin can edit or delete. */
async function seedPostersOnce(): Promise<void> {
  if (postersSeeded) return;
  for (const p of SEED_POSTS) {
    if (await getDoc("_meta", p.marker)) continue;
    await commitWrites([
      { collection: "_meta", id: p.marker, data: { seededAt: new Date().toISOString() }, requireAbsent: true },
      {
        collection: COLLECTION,
        id: p.id,
        data: { kind: "post", title: p.title, body: p.body, image: p.image, portrait: true, visible: true, ...(p.pinned ? { pinned: true } : {}), createdAt: new Date().toISOString() },
        requireAbsent: true,
      },
    ]);
  }
  postersSeeded = true;
}

/** By default, only visible posts are returned, newest first — pass
 *  includeHidden for the admin panel, which needs to see (and un-hide) everything. */
export async function getMediaPosts(opts?: { includeHidden?: boolean }): Promise<MediaPost[]> {
  await seedPostersOnce().catch(() => undefined);
  const docs = await listCollection(COLLECTION, {
    orderBy: "createdAt",
    direction: "DESCENDING",
    // The admin panel needs the true full list to manage/un-hide everything;
    // the public site only ever renders recent posts, so it's capped.
    limit: opts?.includeHidden ? undefined : PUBLIC_FETCH_LIMIT,
  });
  const all = docs.map((d) => toMediaPost(d.id, d.data));
  if (opts?.includeHidden) return all; // admin: keep the raw data URL so the edit form round-trips it unchanged
  return all.filter((p) => p.visible !== false).map((p) => ({ ...p, image: p.image ? publicImageSrc("media", p.id, p.image) : p.image }));
}

/** Counts currently-pinned posts, optionally excluding one id (used when re-saving an already-pinned post). */
export async function countPinnedPosts(excludeId?: string): Promise<number> {
  const all = await getMediaPosts({ includeHidden: true });
  return all.filter((p) => p.pinned && p.id !== excludeId).length;
}

export async function addMediaPost(data: MediaPostInput): Promise<string> {
  return addDoc(COLLECTION, { ...data, createdAt: new Date().toISOString() });
}

export async function updateMediaPost(id: string, data: Partial<MediaPostInput>): Promise<void> {
  await setDocMerge(COLLECTION, id, data);
}

export async function deleteMediaPost(id: string): Promise<void> {
  await deleteDoc(COLLECTION, id);
}
