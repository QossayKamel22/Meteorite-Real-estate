// Pure helpers (no server-only imports) so they can be unit-tested with Node.

/** Which Firestore document type an uploaded image belongs to. */
export type ImageKind = "agent" | "certificate" | "media" | "property" | "featured";

export const IMAGE_KINDS: readonly ImageKind[] = ["agent", "certificate", "media", "property", "featured"];

/** Firestore document ids are 20-char alphanumerics; accept only that shape before building a path. */
export const SAFE_DOC_ID = /^[A-Za-z0-9_-]{1,64}$/;

/** 32-bit FNV-1a, base36. Only used to change a URL when the image changes. */
export function shortHash(input: string): string {
  let h = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h.toString(36);
}

/**
 * Admin-uploaded images are stored as base64 data URLs on Firestore documents.
 * Embedding them in a page makes every cached copy huge (a 950KB About Us page
 * costs real CPU to parse on every visit, and big inline data URLs have broken
 * SSR streaming here before), so public pages reference them by URL instead:
 * /api/img/<kind>/<id>?v=<hash>. The hash changes whenever the image does, so
 * the URL can be cached forever. Anything that isn't a data URL (a static
 * /brand/... file or an https link) is returned untouched.
 */
export function publicImageSrc(kind: ImageKind, id: string, value: string | undefined): string {
  if (!value) return "";
  if (!value.startsWith("data:image/")) return value;
  if (!SAFE_DOC_ID.test(id)) return value;
  return `/api/img/${kind}/${id}?v=${shortHash(value)}`;
}

/** True for URLs produced by publicImageSrc — those are already optimised, so next/image should skip its optimiser. */
export function isServedImage(src: string): boolean {
  return src.startsWith("/api/img/");
}
