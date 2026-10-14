// Shared by the API routes (validation) and tests. Pure TypeScript, no imports.

/** A certificate can show up to this many images (e.g. the current card plus earlier ones). */
export const MAX_CERT_IMAGES = 8;

const DATA_IMAGE = /^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/]+=*$/;
const MAX_ONE = 600_000; // characters of one data URL
const MAX_TOTAL = 900_000; // Firestore documents are capped at 1 MiB, so keep the whole set under it

function isHttps(v: string): boolean {
  try {
    const u = new URL(v);
    return u.protocol === "https:" && u.hostname.includes(".");
  } catch {
    return false;
  }
}

/** A site-relative file under /brand/ (the bundled seed image), with no path tricks. */
function isBrandPath(v: string): boolean {
  return /^\/brand\/[A-Za-z0-9._\-/]+$/.test(v) && !v.includes("..") && !v.includes("//");
}

export type ImagesResult = { ok: true; images: string[] } | { ok: false; error: string };

/**
 * Reads the images for a certificate from a request body. The preferred field is
 * `images` (an ordered list, newest first — the first one is the one shown first
 * and used as the certificate's main image); the legacy single `image` is still
 * accepted. Never trusts the client: every entry is checked.
 */
export function normalizeCertificateImages(body: { images?: unknown; image?: unknown }): ImagesResult {
  let raw: unknown[];
  if (Array.isArray(body.images)) raw = body.images;
  else if (typeof body.image === "string") raw = [body.image];
  else return { ok: false, error: "At least one image is required." };

  const images: string[] = [];
  let total = 0;
  for (const item of raw) {
    if (typeof item !== "string") return { ok: false, error: "Each image must be a file or a link." };
    const v = item.trim();
    if (!v) continue; // ignore blank rows
    if (v.length > MAX_ONE) return { ok: false, error: "One of the images is too large. Try a smaller one." };
    if (!isHttps(v) && !isBrandPath(v) && !DATA_IMAGE.test(v)) {
      return { ok: false, error: "Images must be uploaded JPG/PNG/WebP files or https:// links." };
    }
    total += v.length;
    images.push(v);
  }
  if (images.length === 0) return { ok: false, error: "At least one image is required." };
  if (images.length > MAX_CERT_IMAGES) return { ok: false, error: `You can add up to ${MAX_CERT_IMAGES} images per certificate.` };
  if (total > MAX_TOTAL) return { ok: false, error: "The images together are too large. Remove one or use smaller files." };
  return { ok: true, images };
}
