import "server-only";
import { batchGetDocs, incrementFieldsMulti } from "@/lib/firestore-rest";
import { CATEGORY_KEYS, categorize, type CategoryKey } from "@/lib/analytics-categories";

const DAILY_COLLECTION = "analyticsDaily";
const TOTALS_COLLECTION = "analyticsTotals";
const TOTALS_DOC = "summary";

const CATEGORY_LABELS: Record<CategoryKey, string> = {
  home: "Home",
  aboutUs: "About Us",
  forSale: "For Sale",
  forRent: "For Rent",
  media: "Media",
  contactUs: "Contact Us",
  propertyDetail: "Property Details",
  other: "Other",
};

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

/** Records one page view, bucketed by day and by site section. Best-effort — never throws. */
export async function recordPageView(path: string): Promise<void> {
  const category = categorize(path);
  const deltas = { total: 1, [category]: 1 };
  try {
    // One :commit call covering both documents, instead of two separate
    // round trips — this runs on every single page view site-wide, so it's
    // the highest-frequency Firestore write path in the app.
    await incrementFieldsMulti([
      { collection: DAILY_COLLECTION, id: todayKey(), deltas },
      { collection: TOTALS_COLLECTION, id: TOTALS_DOC, deltas },
    ]);
  } catch (err) {
    console.error("recordPageView failed", err);
  }
}

export type DailyPoint = { date: string; iso: string; count: number };
export type CategoryBreakdown = { name: string; value: number };

const TREND_DAYS = 30;

export async function getAnalyticsSummary(): Promise<{
  totalAllTime: number;
  totalToday: number;
  last30Days: DailyPoint[];
  breakdown: CategoryBreakdown[];
  devices: CategoryBreakdown[];
  hours: number[];
  topPages: CategoryBreakdown[];
  topProperties: { id: string; value: number }[];
}> {
  const days: string[] = [];
  const now = new Date();
  now.setUTCHours(0, 0, 0, 0);
  for (let i = TREND_DAYS - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setUTCDate(d.getUTCDate() - i);
    days.push(d.toISOString().slice(0, 10));
  }

  // A single batched read instead of 31 separate getDoc round trips.
  const [totalsDoc, ...dailyDocs] = await batchGetDocs([
    { collection: TOTALS_COLLECTION, id: TOTALS_DOC },
    ...days.map((d) => ({ collection: DAILY_COLLECTION, id: d })),
  ]);

  const totals = (totalsDoc?.data ?? {}) as Record<string, number>;

  const last30Days = days.map((date, i) => ({
    iso: date,
    date: new Date(date).toLocaleDateString(undefined, { month: "short", day: "numeric" }),
    count: Number((dailyDocs[i]?.data as Record<string, number> | undefined)?.total ?? 0),
  }));

  const breakdown = CATEGORY_KEYS.map((key) => ({
    name: CATEGORY_LABELS[key],
    value: Number(totals[key] ?? 0),
  })).filter((b) => b.value > 0);

  const num = (k: string) => Number(totals[k] ?? 0);
  const devices = (["mobile", "desktop", "tablet"] as const).map((d) => ({ name: d[0].toUpperCase() + d.slice(1), value: num(`dev_${d}`) })).filter((d) => d.value > 0);
  const hours = Array.from({ length: 24 }, (_, h) => num(`h${String(h).padStart(2, "0")}`));
  const PAGE_NAMES: Record<string, string> = { home: "Home", about_us: "About Us", for_sale: "For Sale", for_rent: "For Rent", media: "Media", contact_us: "Contact Us", favorites: "Saved", login: "Sign in", register: "Register", privacy_policy: "Privacy" };
  const topPages = Object.entries(totals)
    .filter(([k]) => k.startsWith("p_") && Number(totals[k]) > 0)
    .map(([k, v]) => ({ name: PAGE_NAMES[k.slice(2)] ?? `/${k.slice(2).replace(/_/g, "-")}`, value: Number(v) }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 6);
  const topProperties = Object.entries(totals)
    .filter(([k]) => k.startsWith("pp_") && Number(totals[k]) > 0)
    .map(([k, v]) => ({ id: k.slice(3).replace(/_/g, "-"), value: Number(v) }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);

  return {
    totalAllTime: Number(totals.total ?? 0),
    totalToday: last30Days[last30Days.length - 1]?.count ?? 0,
    last30Days,
    breakdown,
    devices,
    hours,
    topPages,
    topProperties,
  };
}
