import "server-only";
import { adminDb } from "@/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";

const CERTS_COL = adminDb.collection("certificates");

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

const SEED_MARKER = adminDb.collection("_meta").doc("certificatesSeeded");

/**
 * Seeds once, guarded by a transaction on a sentinel doc so concurrent
 * calls (e.g. multiple pages building in parallel) can't both pass the
 * "is it empty" check and double-insert the seed data.
 */
async function seedIfEmpty(): Promise<void> {
  await adminDb.runTransaction(async (tx) => {
    const marker = await tx.get(SEED_MARKER);
    if (marker.exists) return;
    tx.set(SEED_MARKER, { seededAt: FieldValue.serverTimestamp() });
    SEED_CERTIFICATES.forEach((cert, i) => {
      tx.set(CERTS_COL.doc(), { ...cert, order: i });
    });
  });
}

/** Fields that make up the public Certificate shape — excludes internal
 *  bookkeeping fields like `updatedAt` (a Firestore Timestamp instance),
 *  which can't cross the Server->Client Component boundary as a class
 *  instance. */
const CERTIFICATE_FIELDS = [
  "title",
  "image",
  "issuer",
  "licenseNo",
  "registrationDate",
  "expiryDate",
  "activities",
  "order",
  "visible",
] as const;

function toPlainCertificate(id: string, data: FirebaseFirestore.DocumentData): Certificate {
  const cert = { id } as Record<string, unknown>;
  for (const key of CERTIFICATE_FIELDS) {
    if (data[key] !== undefined) cert[key] = data[key];
  }
  return cert as Certificate;
}

/** By default, only certificates visible on the public site are returned — pass
 *  includeHidden for the admin panel, which needs to see (and un-hide) everything. */
export async function getCertificates(opts?: { includeHidden?: boolean }): Promise<Certificate[]> {
  await seedIfEmpty();
  const snap = await CERTS_COL.orderBy("order", "asc").get();
  const all = snap.docs.map((doc) => toPlainCertificate(doc.id, doc.data()));
  return opts?.includeHidden ? all : all.filter((c) => c.visible !== false);
}

export async function addCertificate(data: CertificateInput): Promise<string> {
  const countSnap = await CERTS_COL.get();
  const ref = await CERTS_COL.add({ ...data, order: countSnap.size });
  return ref.id;
}

export async function updateCertificate(
  id: string,
  data: Partial<CertificateInput>
): Promise<void> {
  await CERTS_COL.doc(id).update({ ...data, updatedAt: FieldValue.serverTimestamp() });
}

export async function deleteCertificate(id: string): Promise<void> {
  await CERTS_COL.doc(id).delete();
}

/** Swaps this certificate's `order` with its neighbor above/below (no-op at the ends). */
export async function moveCertificate(id: string, direction: "up" | "down"): Promise<void> {
  const snap = await CERTS_COL.orderBy("order", "asc").get();
  const docs = snap.docs;
  const idx = docs.findIndex((d) => d.id === id);
  const swapIdx = direction === "up" ? idx - 1 : idx + 1;
  if (idx === -1 || swapIdx < 0 || swapIdx >= docs.length) return;

  const a = docs[idx];
  const b = docs[swapIdx];
  await adminDb.runTransaction(async (tx) => {
    tx.update(a.ref, { order: b.data().order });
    tx.update(b.ref, { order: a.data().order });
  });
}
