import "server-only";
import { publicImageSrc } from "@/lib/image-url";
import { addDoc, commitWrites, countCollection, deleteDoc, getDoc, listCollection, setDocMerge } from "@/lib/firestore-rest";

const COLLECTION = "certificates";

export type Certificate = {
  id: string;
  title: string;
  /** The main (newest) image — always the same as images[0]; kept so older code and data keep working. */
  image: string;
  /** Every image for this certificate, newest first. Always has at least one. */
  images: string[];
  issuer?: string;
  licenseNo?: string;
  registrationDate?: string;
  expiryDate?: string;
  activities?: string[];
  order: number;
  /** Defaults to true when absent (existing docs predate this field). */
  visible?: boolean;
};

export type CertificateInput = Omit<Certificate, "id" | "order">;

/**
 * Seed data — the real Dubai Land Department / RERA registration
 * certificate as shown on meteoriterealestate.com/about-us/. Used only
 * to populate Firestore the first time the collection is empty.
 */
const SEED_CERTIFICATES: CertificateInput[] = [
  {
    title: "Real Estate Office Registration Certificate",
    image: "/brand/certificate-rera.jpg",
    images: ["/brand/certificate-rera.jpg"],
    issuer: "Dubai Land Department · RERA",
    licenseNo: "916037",
    registrationDate: "10/11/2020",
    expiryDate: "9/11/2026",
    activities: ["Leasing Property Brokerage Agents", "Real Estate Buying & Selling Brokerage"],
  },
];

const SEED_MARKER_COLLECTION = "_meta";
const SEED_MARKER_ID = "certificatesSeeded";

/**
 * Seeds once, guarded by a `requireAbsent` precondition on a sentinel doc
 * within the same atomic commit, so concurrent calls (e.g. multiple pages
 * building in parallel) can't both pass the "is it empty" check and
 * double-insert the seed data.
 */
// Once the seed marker has been seen, never re-check it for the life of this isolate.
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
    ...SEED_CERTIFICATES.map((cert, i) => ({
      collection: COLLECTION,
      id: crypto.randomUUID(),
      data: { ...cert, order: i },
      requireAbsent: true,
    })),
  ]);
}

function toCertificate(id: string, data: Record<string, unknown>): Certificate {
  // Older documents only have the single `image` field.
  const list = Array.isArray(data.images) ? data.images.filter((v): v is string => typeof v === "string" && v !== "") : [];
  const images = list.length > 0 ? list : data.image ? [data.image as string] : [];
  return {
    id,
    title: data.title as string,
    image: images[0] ?? "",
    images,
    order: (data.order as number) ?? 0,
    issuer: data.issuer as string | undefined,
    licenseNo: data.licenseNo as string | undefined,
    registrationDate: data.registrationDate as string | undefined,
    expiryDate: data.expiryDate as string | undefined,
    activities: data.activities as string[] | undefined,
    visible: data.visible as boolean | undefined,
  };
}

/** By default, only certificates visible on the public site are returned — pass
 *  includeHidden for the admin panel, which needs to see (and un-hide) everything. */
export async function getCertificates(opts?: { includeHidden?: boolean }): Promise<Certificate[]> {
  await seedIfEmpty();
  const docs = await listCollection(COLLECTION, { orderBy: "order" });
  const all = docs.map((d) => toCertificate(d.id, d.data));
  if (opts?.includeHidden) return all; // admin: keep the raw data URL so the edit form round-trips it unchanged
  // Public pages reference uploaded images by URL; the index picks the right entry of `images`.
  return all
    .filter((c) => c.visible !== false)
    .map((c) => {
      const images = c.images.map((img, i) => publicImageSrc("certificate", c.id, img, i));
      return { ...c, images, image: images[0] ?? "" };
    });
}

export async function addCertificate(data: CertificateInput): Promise<string> {
  const order = await countCollection(COLLECTION);
  return addDoc(COLLECTION, { ...data, image: data.images[0], order });
}

export async function updateCertificate(id: string, data: Partial<CertificateInput>): Promise<void> {
  // Keep the legacy single `image` field equal to the first (newest) image.
  const image = data.images && data.images.length > 0 ? { image: data.images[0] } : {};
  await setDocMerge(COLLECTION, id, { ...data, ...image, updatedAt: new Date().toISOString() });
}

export async function deleteCertificate(id: string): Promise<void> {
  await deleteDoc(COLLECTION, id);
}

/** Swaps this certificate's `order` with its neighbor above/below (no-op at the ends). */
export async function moveCertificate(id: string, direction: "up" | "down"): Promise<void> {
  const docs = await listCollection(COLLECTION, { orderBy: "order" });
  const idx = docs.findIndex((d) => d.id === id);
  const swapIdx = direction === "up" ? idx - 1 : idx + 1;
  if (idx === -1 || swapIdx < 0 || swapIdx >= docs.length) return;

  const a = docs[idx];
  const b = docs[swapIdx];
  await commitWrites([
    { collection: COLLECTION, id: a.id, data: { ...a.data, order: b.data.order } },
    { collection: COLLECTION, id: b.id, data: { ...b.data, order: a.data.order } },
  ]);
}
