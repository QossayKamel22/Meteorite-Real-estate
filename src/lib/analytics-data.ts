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

export type DailyPoint = { date: string; count: number };
export type CategoryBreakdown = { name: string; value: number };

const TREND_DAYS = 14;

export async function getAnalyticsSummary(): Promise<{
  totalAllTime: number;
  totalToday: number;
  last14Days: DailyPoint[];
  breakdown: CategoryBreakdown[];
}> {
  const days: string[] = [];
  const now = new Date();
  now.setUTCHours(0, 0, 0, 0);
  for (let i = TREND_DAYS - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setUTCDate(d.getUTCDate() - i);
    days.push(d.toISOString().slice(0, 10));
  }

  // A single batched read instead of 15 separate getDoc round trips.
  const [totalsDoc, ...dailyDocs] = await batchGetDocs([
    { collection: TOTALS_COLLECTION, id: TOTALS_DOC },
    ...days.map((d) => ({ collection: DAILY_COLLECTION, id: d })),
  ]);

  const totals = (totalsDoc?.data ?? {}) as Record<string, number>;

  const last14Days = days.map((date, i) => ({
    date: new Date(date).toLocaleDateString(undefined, { month: "short", day: "numeric" }),
    count: Number((dailyDocs[i]?.data as Record<string, number> | undefined)?.total ?? 0),
  }));

  const breakdown = CATEGORY_KEYS.map((key) => ({
    name: CATEGORY_LABELS[key],
    value: Number(totals[key] ?? 0),
  })).filter((b) => b.value > 0);

  return {
    totalAllTime: Number(totals.total ?? 0),
    totalToday: last14Days[last14Days.length - 1]?.count ?? 0,
    last14Days,
    breakdown,
  };
}
