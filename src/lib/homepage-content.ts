import "server-only";
import { adminDb } from "@/lib/firebase-admin";

const DOC = adminDb.collection("settings").doc("homepage");

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
  const snap = await DOC.get();
  if (!snap.exists) {
    await DOC.set(DEFAULTS);
    return DEFAULTS;
  }
  return { ...DEFAULTS, ...(snap.data() as Partial<HomepageContent>) };
}

export async function updateHomepageContent(patch: Partial<HomepageContent>): Promise<void> {
  await DOC.set(patch, { merge: true });
}
