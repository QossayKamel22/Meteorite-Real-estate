import "server-only";
import { addDoc, commitWrites, countCollection, deleteDoc, getDoc, listCollection, setDocMerge } from "@/lib/firestore-rest";

const COLLECTION = "properties";

export type Purpose = "sale" | "rent";

export type Property = {
  id: string;
  title: string;
  purpose: Purpose;
  price: number;
  /** Only meaningful when purpose is "rent". */
  rentFrequency?: "yearly" | "monthly";
  type: string;
  isStudio?: boolean;
  bedrooms: number;
  bathrooms: number;
  sizeSqft: number;
  location: string;
  description?: string;
  amenities?: string[];
  image: string;
  /** Set only for listings imported from Bayut — links back to the original listing. */
  sourceUrl?: string;
  order: number;
  /** Defaults to true when absent. */
  visible?: boolean;
};

export type PropertyInput = Omit<Property, "id" | "order">;

/**
 * Seed data — the company's real, currently-live Bayut listings
 * (bayut.com/companies/meteorite-real-estate-10128/), fetched on
 * 2026-09-20. Used only to populate Firestore the first time the
 * collection is empty; the admin can add/edit/delete/reorder from there.
 */
const SEED_PROPERTIES: PropertyInput[] = [
  {
    title: "Exclusive - Single Row - Ready to Move In - Spacious Very Well Maintained | G+1 4BR Villa",
    purpose: "sale",
    price: 4250000,
    type: "Villa",
    bedrooms: 4,
    bathrooms: 5,
    sizeSqft: 2426,
    location: "Al Furjan, Dubai",
    description:
      "A single-row, fully maintained villa featuring ground plus one floor with dining, living and family rooms, maid's quarters, laundry, storage, terraces and balconies — a move-in ready home in a well-established community.",
    amenities: [
      "Centrally air-conditioned",
      "Central heating",
      "Double-glazed windows",
      "2 parking spaces",
      "Balcony/terrace",
      "Kids play area",
      "Lawn/garden",
      "Barbeque area",
      "Freehold property",
    ],
    image: "https://images.bayut.com/thumbnails/833683543-800x600.jpeg",
    sourceUrl: "https://www.bayut.com/property/details-14964545.html",
  },
  {
    title: "Exclusive Fully Furnished Spacious Biggest Layout 2BR",
    purpose: "sale",
    price: 1695000,
    type: "Apartment",
    bedrooms: 2,
    bathrooms: 3,
    sizeSqft: 1367,
    location: "Tower 108, JVC District 18, Jumeirah Village Circle (JVC), Dubai",
    description:
      "Fully furnished 2-bedroom apartment with a spacious and efficient layout, bright interiors, and two balconies with skyline and community views.",
    amenities: [
      "Fully furnished",
      "2 balconies",
      "Built-in wardrobes",
      "Swimming pool access",
      "Gym",
      "Sauna and steam room",
      "24-hour concierge",
      "CCTV security",
      "1 parking space",
      "Pets allowed",
    ],
    image: "https://images.bayut.com/thumbnails/815499477-800x600.jpeg",
    sourceUrl: "https://www.bayut.com/property/details-13972106.html",
  },
  {
    title: "Spacious 3BR Ready to Move | Maidroom + Laundry + Storage | Balcony & City View",
    purpose: "rent",
    price: 150000,
    rentFrequency: "yearly",
    type: "Apartment",
    bedrooms: 3,
    bathrooms: 4,
    sizeSqft: 1776,
    location: "Masakin Al Furjan Block E, Al Furjan, Dubai",
    description:
      "Unfurnished residence in a gated community with a practical layout, multiple living areas, four bathrooms and a dedicated kitchen — convenient access to Sheikh Mohammed Bin Zayed Road and the nearby metro station.",
    amenities: [
      "Maidroom with storage",
      "Laundry area",
      "Balcony/terrace",
      "Built-in wardrobes",
      "2 parking lots",
      "Centrally air-conditioned",
      "CCTV security",
      "Kids play area",
      "24-hour concierge",
    ],
    image: "https://images.bayut.com/thumbnails/866001001-800x600.jpeg",
    sourceUrl: "https://www.bayut.com/property/details-16492375.html",
  },
  {
    title: "Exclusive Ready to Move - Fully Renovated - Spacious 3 Master BR + Maid with Bathroom",
    purpose: "rent",
    price: 100000,
    rentFrequency: "yearly",
    type: "Villa",
    bedrooms: 3,
    bathrooms: 5,
    sizeSqft: 2402,
    location: "Sanctuary, DAMAC Hills 2 (Akoya by DAMAC), Dubai",
    description:
      "Fully renovated villa — brand-new kitchen, water pump and water tank, fully repainted inside and out, vacant and ready to move in.",
    amenities: [
      "Vacant and ready to move",
      "Balcony/terrace",
      "Swimming pool, Jacuzzi, sauna, steam room",
      "Gym",
      "Kids play area, lawn/garden, barbecue area",
      "Security staff",
      "CCTV security",
      "Laundry facility",
    ],
    image: "https://images.bayut.com/thumbnails/822963775-800x600.jpeg",
    sourceUrl: "https://www.bayut.com/property/details-14355695.html",
  },
  {
    title: "Spacious Direct Swimming Pool View - Ready to Move In - Semi Furnished 1BR",
    purpose: "rent",
    price: 75000,
    rentFrequency: "yearly",
    type: "Apartment",
    bedrooms: 1,
    bathrooms: 2,
    sizeSqft: 838,
    location: "Binghatti Orchid, JVC District 10, Jumeirah Village Circle (JVC), Dubai",
    description:
      "Brand-new semi-furnished 1-bedroom unit with direct pool views, built-in wardrobes, kitchen appliances, a laundry room, and a smart access system.",
    amenities: [
      "Swimming pool",
      "Gym",
      "24-hour security",
      "Reception services",
      "1 parking space",
      "Double glazed windows",
      "Balcony/terrace",
      "Kids play area",
      "Jacuzzi, sauna, steam room",
      "Pets allowed",
    ],
    image: "https://images.bayut.com/thumbnails/775681765-800x600.jpeg",
    sourceUrl: "https://www.bayut.com/property/details-11694551.html",
  },
  {
    title: "Semi Studio as Brand New | Swimming Pool View | Ready to Move In",
    purpose: "rent",
    price: 46000,
    rentFrequency: "yearly",
    type: "Studio",
    isStudio: true,
    bedrooms: 0,
    bathrooms: 1,
    sizeSqft: 372,
    location: "Creek Views by Azizi, Dubai Healthcare City Phase 2, Al Jaddaf, Dubai",
    description:
      "Newly constructed studio on the 7th floor with the building's biggest balcony, high-end finishing, and white kitchen appliances.",
    amenities: [
      "Swimming pool & kids' pool",
      "Gymnasium, sauna, steam room",
      "Kids' play area & landscaped gardens",
      "Jogging track & basketball court",
      "Covered parking",
      "24-hour concierge",
      "CCTV security",
      "Pets allowed",
    ],
    image: "https://images.bayut.com/thumbnails/865325257-800x600.jpeg",
    sourceUrl: "https://www.bayut.com/property/details-7224603.html",
  },
  {
    title: "Ready to Move In a Very Well-Maintained Studio + Balcony",
    purpose: "rent",
    price: 38900,
    rentFrequency: "yearly",
    type: "Studio",
    isStudio: true,
    bedrooms: 0,
    bathrooms: 1,
    sizeSqft: 432,
    location: "Tower A, Rukan Tower, Rukan, Dubailand, Dubai",
    description:
      "Unfurnished studio with an open-plan layout, floor-to-ceiling sliding glass doors, and a bright balcony overlooking community streets and villas.",
    amenities: [
      "Balcony/terrace",
      "Swimming pool",
      "Gym",
      "Jacuzzi, sauna, steam room",
      "Kids play area",
      "24-hour concierge",
      "Prayer room",
      "Laundry facility",
      "Barbecue area",
    ],
    image: "https://images.bayut.com/thumbnails/827847950-800x600.jpeg",
    sourceUrl: "https://www.bayut.com/property/details-14641195.html",
  },
  {
    title: "High Floor Ready to Move In - Fully Furnished 1BR | DAMAC Ghalia | City & Pool Views",
    purpose: "rent",
    price: 58000,
    rentFrequency: "yearly",
    type: "Apartment",
    bedrooms: 1,
    bathrooms: 2,
    sizeSqft: 675,
    location: "DAMAC Ghalia, JVC District 18, Jumeirah Village Circle (JVC), Dubai",
    description:
      "Furnished unit with an open-plan living and kitchen area, two bathrooms, and a bright bedroom, in a serviced building with balcony city and pool views.",
    amenities: [
      "Furnished with built-in wardrobes",
      "Balconies with city and pool views",
      "Centrally air-conditioned",
      "24-hour reception/concierge",
      "Covered parking with valet",
      "Community pools and gyms",
      "Prayer rooms",
      "Kids play area",
    ],
    image: "https://images.bayut.com/thumbnails/849086978-800x600.jpeg",
    sourceUrl: "https://www.bayut.com/property/details-15678297.html",
  },
];

const SEED_MARKER_COLLECTION = "_meta";
const SEED_MARKER_ID = "propertiesSeeded";

async function seedIfEmpty(): Promise<void> {
  const marker = await getDoc(SEED_MARKER_COLLECTION, SEED_MARKER_ID);
  if (marker) return;

  await commitWrites([
    { collection: SEED_MARKER_COLLECTION, id: SEED_MARKER_ID, data: { seededAt: new Date().toISOString() }, requireAbsent: true },
    ...SEED_PROPERTIES.map((p, i) => ({
      collection: COLLECTION,
      id: crypto.randomUUID(),
      data: { ...p, order: i },
      requireAbsent: true,
    })),
  ]);
}

function toProperty(id: string, data: Record<string, unknown>): Property {
  return {
    id,
    title: data.title as string,
    purpose: data.purpose as Purpose,
    price: data.price as number,
    rentFrequency: data.rentFrequency as "yearly" | "monthly" | undefined,
    type: data.type as string,
    isStudio: data.isStudio as boolean | undefined,
    bedrooms: (data.bedrooms as number) ?? 0,
    bathrooms: (data.bathrooms as number) ?? 0,
    sizeSqft: (data.sizeSqft as number) ?? 0,
    location: data.location as string,
    description: data.description as string | undefined,
    amenities: data.amenities as string[] | undefined,
    image: data.image as string,
    sourceUrl: data.sourceUrl as string | undefined,
    order: (data.order as number) ?? 0,
    visible: data.visible as boolean | undefined,
  };
}

/** By default, only visible properties are returned — pass includeHidden
 *  for the admin panel, which needs to see (and un-hide) everything. */
export async function getProperties(opts?: {
  purpose?: Purpose;
  includeHidden?: boolean;
}): Promise<Property[]> {
  await seedIfEmpty();
  const docs = await listCollection(COLLECTION, { orderBy: "order" });
  let all = docs.map((d) => toProperty(d.id, d.data));
  if (opts?.purpose) all = all.filter((p) => p.purpose === opts.purpose);
  return opts?.includeHidden ? all : all.filter((p) => p.visible !== false);
}

export async function getProperty(id: string): Promise<Property | null> {
  const doc = await getDoc(COLLECTION, id);
  return doc ? toProperty(doc.id, doc.data) : null;
}

export async function addProperty(data: PropertyInput): Promise<string> {
  const order = await countCollection(COLLECTION);
  return addDoc(COLLECTION, { ...data, order });
}

export async function updateProperty(id: string, data: Partial<PropertyInput>): Promise<void> {
  await setDocMerge(COLLECTION, id, { ...data, updatedAt: new Date().toISOString() });
}

export async function deleteProperty(id: string): Promise<void> {
  await deleteDoc(COLLECTION, id);
}

/** Swaps this property's `order` with its neighbor above/below (no-op at the ends). */
export async function moveProperty(id: string, direction: "up" | "down"): Promise<void> {
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
