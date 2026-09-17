import "server-only";
import { promises as fs } from "fs";
import path from "path";

const DATA_PATH = path.join(process.cwd(), "data", "site-stats.json");

export const STAT_FIELDS = [
  { key: "propertiesSubmitted", label: "Properties Submitted" },
  { key: "professionalAgents", label: "Professional Agents" },
  { key: "successStories", label: "Success Stories" },
  { key: "happyCustomers", label: "Happy Customers" },
] as const;

export type StatKey = (typeof STAT_FIELDS)[number]["key"];
export type SiteStats = Record<StatKey, number>;

const DEFAULTS: SiteStats = {
  propertiesSubmitted: 325,
  professionalAgents: 12,
  successStories: 195,
  happyCustomers: 250,
};

/**
 * Reads editable homepage stats from data/site-stats.json.
 *
 * NOTE: this uses the local filesystem, so admin edits persist only when
 * this app runs on a persistent Node server (self-hosted, a VM, etc).
 * On ephemeral serverless hosts (e.g. Vercel's default deployment) the
 * filesystem resets on every deploy/cold start — edits would not survive.
 * For production on serverless, swap this module's read/write for a real
 * database (Postgres, Supabase, etc.) while keeping the same interface.
 */
export async function getStats(): Promise<SiteStats> {
  try {
    const raw = await fs.readFile(DATA_PATH, "utf-8");
    const parsed = JSON.parse(raw) as Partial<SiteStats>;
    return { ...DEFAULTS, ...parsed };
  } catch {
    return DEFAULTS;
  }
}

export async function getStatsList() {
  const stats = await getStats();
  return STAT_FIELDS.map((f) => ({ ...f, value: stats[f.key] }));
}

export type StatsList = Awaited<ReturnType<typeof getStatsList>>;

export async function updateStats(next: SiteStats): Promise<void> {
  await fs.mkdir(path.dirname(DATA_PATH), { recursive: true });
  await fs.writeFile(DATA_PATH, JSON.stringify(next, null, 2) + "\n", "utf-8");
}
