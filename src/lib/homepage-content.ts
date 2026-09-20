import "server-only";
import { getDoc, setDocMerge } from "@/lib/firestore-rest";

const COLLECTION = "settings";
const DOC_ID = "homepage";

export type HomepageContent = {
  heroBadge: string;
  heroHeadline: string;
  heroSubheadline: string;
};

/**
 * Original hero copy, verbatim from the live site — used only to seed
 * Firestore the first time this document is read, if it doesn't exist yet.
 */
const DEFAULTS: HomepageContent = {
  heroBadge: "RERA-Certified · Trusted Since 2005",
  heroHeadline: "The best way to find your dream home.",
  heroSubheadline:
    "We help you get the best deal — a RERA-certified brokerage guiding you through buying, selling, leasing and property management across the UAE.",
};

export async function getHomepageContent(): Promise<HomepageContent> {
  const doc = await getDoc(COLLECTION, DOC_ID);
  if (!doc) {
    await setDocMerge(COLLECTION, DOC_ID, DEFAULTS);
    return DEFAULTS;
  }
  return { ...DEFAULTS, ...(doc.data as Partial<HomepageContent>) };
}

export async function updateHomepageContent(patch: Partial<HomepageContent>): Promise<void> {
  await setDocMerge(COLLECTION, DOC_ID, patch);
}
