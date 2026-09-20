import "server-only";
import { getDoc, setDocMerge } from "@/lib/firestore-rest";

const COLLECTION = "stats";
const DOC_ID = "homepage";

export const STAT_FIELDS = [
  { key: "propertiesSubmitted", label: "Properties Submitted" },
  { key: "professionalAgents", label: "Professional Agents" },
  { key: "successStories", label: "Success Stories" },
  { key: "happyCustomers", label: "Happy Customers" },
] as const;

export type StatKey = (typeof STAT_FIELDS)[number]["key"];
export type SiteStats = Record<StatKey, number>;
export type StatVisibility = Partial<Record<StatKey, boolean>>;

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

type StatsDoc = Partial<SiteStats> & { visibility?: StatVisibility };

async function getStatsDoc(): Promise<StatsDoc> {
  const doc = await getDoc(COLLECTION, DOC_ID);
  if (!doc) {
    await setDocMerge(COLLECTION, DOC_ID, DEFAULTS);
    return DEFAULTS;
  }
  return doc.data as StatsDoc;
}

/** Reads editable homepage stats from Firestore (stats/homepage). */
export async function getStats(): Promise<SiteStats> {
  const doc = await getStatsDoc();
  return { ...DEFAULTS, ...doc };
}

/** By default, only stat fields marked visible are returned — pass
 *  includeHidden for the admin panel, which needs to see (and un-hide) everything. */
export async function getStatsList(opts?: { includeHidden?: boolean }) {
  const doc = await getStatsDoc();
  const stats = { ...DEFAULTS, ...doc };
  const visibility = doc.visibility ?? {};
  const all = STAT_FIELDS.map((f) => ({
    ...f,
    value: stats[f.key],
    visible: visibility[f.key] !== false,
  }));
  return opts?.includeHidden ? all : all.filter((f) => f.visible);
}

export type StatsList = Awaited<ReturnType<typeof getStatsList>>;

export async function updateStats(next: SiteStats): Promise<void> {
  await setDocMerge(COLLECTION, DOC_ID, next);
}

export async function updateStatsVisibility(next: StatVisibility): Promise<void> {
  await setDocMerge(COLLECTION, DOC_ID, { visibility: next });
}
