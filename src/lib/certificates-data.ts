import "server-only";
import { addDoc, commitWrites, countCollection, deleteDoc, getDoc, listCollection, setDocMerge } from "@/lib/firestore-rest";

const COLLECTION = "certificates";

export type Certificate = {
  id: string;
  title: string;
  image: string;
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
async function seedIfEmpty(): Promise<void> {
  const marker = await getDoc(SEED_MARKER_COLLECTION, SEED_MARKER_ID);
  if (marker) return;

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
  return {
    id,
    title: data.title as string,
    image: data.image as string,
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
  return opts?.includeHidden ? all : all.filter((c) => c.visible !== false);
}

export async function addCertificate(data: CertificateInput): Promise<string> {
  const order = await countCollection(COLLECTION);
  return addDoc(COLLECTION, { ...data, order });
}

export async function updateCertificate(id: string, data: Partial<CertificateInput>): Promise<void> {
  await setDocMerge(COLLECTION, id, { ...data, updatedAt: new Date().toISOString() });
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
