import "server-only";
import { adminDb } from "@/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";

const TESTIMONIALS_COL = adminDb.collection("testimonials");

export type Testimonial = {
  id: string;
  name: string;
  role: string;
  quote: string;
  order: number;
  /** Defaults to true when absent (existing docs predate this field). */
  visible?: boolean;
};

export type TestimonialInput = Omit<Testimonial, "id" | "order">;

/**
 * Seed data — the real client quotes as shown on meteoriterealestate.com.
 * Used only to populate Firestore the first time the collection is empty.
 */
const SEED_TESTIMONIALS: TestimonialInput[] = [
  {
    name: "Saif",
    role: "Customer",
    quote:
      "Saad is very professional, knowledgeable and helpful… i would highly recommend working with him.",
  },
  {
    name: "Issa Haddad",
    role: "Customer",
    quote: "Very Professional team with high expertise and ethics. All the Best Meteorite",
  },
  {
    name: "Ahmed Alsuwaidi",
    role: "Customer",
    quote:
      "I deal with this company this very professional so, they helped me to find the best option in the market specially saad. Thanks a lot Mr. Saad to find my dream home.",
  },
];

const SEED_MARKER = adminDb.collection("_meta").doc("testimonialsSeeded");

async function seedIfEmpty(): Promise<void> {
  await adminDb.runTransaction(async (tx) => {
    const marker = await tx.get(SEED_MARKER);
    if (marker.exists) return;
    tx.set(SEED_MARKER, { seededAt: FieldValue.serverTimestamp() });
    SEED_TESTIMONIALS.forEach((t, i) => {
      tx.set(TESTIMONIALS_COL.doc(), { ...t, order: i });
    });
  });
}

const TESTIMONIAL_FIELDS = ["name", "role", "quote", "order", "visible"] as const;

function toPlainTestimonial(id: string, data: FirebaseFirestore.DocumentData): Testimonial {
  const t = { id } as Record<string, unknown>;
  for (const key of TESTIMONIAL_FIELDS) {
    if (data[key] !== undefined) t[key] = data[key];
  }
  return t as Testimonial;
}

/** By default, only visible testimonials are returned — pass includeHidden
 *  for the admin panel, which needs to see (and un-hide) everything. */
export async function getTestimonials(opts?: { includeHidden?: boolean }): Promise<Testimonial[]> {
  await seedIfEmpty();
  const snap = await TESTIMONIALS_COL.orderBy("order", "asc").get();
  const all = snap.docs.map((doc) => toPlainTestimonial(doc.id, doc.data()));
  return opts?.includeHidden ? all : all.filter((t) => t.visible !== false);
}

export async function addTestimonial(data: TestimonialInput): Promise<string> {
  const countSnap = await TESTIMONIALS_COL.get();
  const ref = await TESTIMONIALS_COL.add({ ...data, order: countSnap.size });
  return ref.id;
}

export async function updateTestimonial(id: string, data: Partial<TestimonialInput>): Promise<void> {
  await TESTIMONIALS_COL.doc(id).update({ ...data, updatedAt: FieldValue.serverTimestamp() });
}

export async function deleteTestimonial(id: string): Promise<void> {
  await TESTIMONIALS_COL.doc(id).delete();
}

/** Swaps this testimonial's `order` with its neighbor above/below (no-op at the ends). */
export async function moveTestimonial(id: string, direction: "up" | "down"): Promise<void> {
  const snap = await TESTIMONIALS_COL.orderBy("order", "asc").get();
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
