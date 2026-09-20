import "server-only";
import { addDoc, deleteDoc, listCollection, setDocMerge } from "@/lib/firestore-rest";

const COLLECTION = "mediaPosts";

export type MediaPlatform = "instagram" | "facebook" | "twitter" | "youtube" | "other";

export type MediaPost = {
  id: string;
  /** "social": a link out to an existing social media post. "post": a native photo + text post hosted here. */
  kind: "social" | "post";
  title: string;
  body?: string;
  image?: string;
  platform?: MediaPlatform;
  url?: string;
  createdAt: string;
  /** Defaults to true when absent. */
  visible?: boolean;
};

export type MediaPostInput = Omit<MediaPost, "id" | "createdAt">;

function toMediaPost(id: string, data: Record<string, unknown>): MediaPost {
  return {
    id,
    kind: data.kind === "social" ? "social" : "post",
    title: data.title as string,
    body: data.body as string | undefined,
    image: data.image as string | undefined,
    platform: data.platform as MediaPlatform | undefined,
    url: data.url as string | undefined,
    createdAt: (data.createdAt as string) ?? new Date(0).toISOString(),
    visible: data.visible as boolean | undefined,
  };
}

/** By default, only visible posts are returned, newest first — pass
 *  includeHidden for the admin panel, which needs to see (and un-hide) everything. */
export async function getMediaPosts(opts?: { includeHidden?: boolean }): Promise<MediaPost[]> {
  const docs = await listCollection(COLLECTION, { orderBy: "createdAt", direction: "DESCENDING" });
  const all = docs.map((d) => toMediaPost(d.id, d.data));
  return opts?.includeHidden ? all : all.filter((p) => p.visible !== false);
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
