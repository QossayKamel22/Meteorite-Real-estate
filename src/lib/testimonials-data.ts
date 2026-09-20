import "server-only";
import { addDoc, commitWrites, countCollection, deleteDoc, getDoc, listCollection, setDocMerge } from "@/lib/firestore-rest";

const COLLECTION = "testimonials";

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

const SEED_MARKER_COLLECTION = "_meta";
const SEED_MARKER_ID = "testimonialsSeeded";

async function seedIfEmpty(): Promise<void> {
  const marker = await getDoc(SEED_MARKER_COLLECTION, SEED_MARKER_ID);
  if (marker) return;

  await commitWrites([
    { collection: SEED_MARKER_COLLECTION, id: SEED_MARKER_ID, data: { seededAt: new Date().toISOString() }, requireAbsent: true },
    ...SEED_TESTIMONIALS.map((t, i) => ({
      collection: COLLECTION,
      id: crypto.randomUUID(),
      data: { ...t, order: i },
      requireAbsent: true,
    })),
  ]);
}

function toTestimonial(id: string, data: Record<string, unknown>): Testimonial {
  return {
    id,
    name: data.name as string,
    role: data.role as string,
    quote: data.quote as string,
    order: (data.order as number) ?? 0,
    visible: data.visible as boolean | undefined,
  };
}

/** By default, only visible testimonials are returned — pass includeHidden
 *  for the admin panel, which needs to see (and un-hide) everything. */
export async function getTestimonials(opts?: { includeHidden?: boolean }): Promise<Testimonial[]> {
  await seedIfEmpty();
  const docs = await listCollection(COLLECTION, { orderBy: "order" });
  const all = docs.map((d) => toTestimonial(d.id, d.data));
  return opts?.includeHidden ? all : all.filter((t) => t.visible !== false);
}

export async function addTestimonial(data: TestimonialInput): Promise<string> {
  const order = await countCollection(COLLECTION);
  return addDoc(COLLECTION, { ...data, order });
}

export async function updateTestimonial(id: string, data: Partial<TestimonialInput>): Promise<void> {
  await setDocMerge(COLLECTION, id, { ...data, updatedAt: new Date().toISOString() });
}

export async function deleteTestimonial(id: string): Promise<void> {
  await deleteDoc(COLLECTION, id);
}

/** Swaps this testimonial's `order` with its neighbor above/below (no-op at the ends). */
export async function moveTestimonial(id: string, direction: "up" | "down"): Promise<void> {
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
