import "server-only";
import { adminDb } from "@/lib/firebase-admin";

const STATS_DOC = adminDb.collection("stats").doc("homepage");

export const STAT_FIELDS = [
  { key: "propertiesSubmitted", label: "Properties Submitted" },
  { key: "professionalAgents", label: "Professional Agents" },
  { key: "successStories", label: "Success Stories" },
  { key: "happyCustomers", label: "Happy Customers" },
] as const;

export type StatKey = (typeof STAT_FIELDS)[number]["key"];
export type SiteStats = Record<StatKey, number>;

/**
 * Original values as scraped from the live site — used only to seed
 * Firestore the first time this document is read, if it doesn't exist yet.
 */
const DEFAULTS: SiteStats = {
  propertiesSubmitted: 325,
  professionalAgents: 12,
  successStories: 195,
  happyCustomers: 250,
};

/** Reads editable homepage stats from Firestore (stats/homepage). */
export async function getStats(): Promise<SiteStats> {
  const snap = await STATS_DOC.get();
  if (!snap.exists) {
    await STATS_DOC.set(DEFAULTS);
    return DEFAULTS;
  }
  return { ...DEFAULTS, ...(snap.data() as Partial<SiteStats>) };
}

export async function getStatsList() {
  const stats = await getStats();
  return STAT_FIELDS.map((f) => ({ ...f, value: stats[f.key] }));
}

export type StatsList = Awaited<ReturnType<typeof getStatsList>>;

export async function updateStats(next: SiteStats): Promise<void> {
  await STATS_DOC.set(next);
}
