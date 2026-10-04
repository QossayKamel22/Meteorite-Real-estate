import { FIRESTORE_HOST, basePath, getAccessToken } from "@/lib/firestore-auth";
import { categorize } from "@/lib/analytics-categories";

const DAILY_COLLECTION = "analyticsDaily";
const TOTALS_COLLECTION = "analyticsTotals";
const TOTALS_DOC = "summary";

/**
 * The page-view beacon (POST /api/track-visit), answered from the edge
 * middleware instead of the Next route handler. Every visit fires this, and
 * serving it from the route handler forces a cold Worker to load the entire
 * Next server bundle (~100ms of CPU) just to bump two counters — far over the
 * Free plan's ~10ms CPU budget. Same behavior as the route handler in
 * app/api/track-visit/route.ts + recordPageView() in analytics-data.ts, which
 * stay in place as the fallback.
 */
export async function handleTrackVisit(request: Request): Promise<Response> {
  const origin = request.headers.get("origin");
  if (origin) {
    let trusted = false;
    try {
      trusted = new URL(origin).host === new URL(request.url).host;
    } catch {
      trusted = false;
    }
    if (!trusted) return Response.json({ ok: false }, { status: 403 });
  }

  let path = "/";
  try {
    const body = (await request.json()) as { path?: string };
    if (typeof body.path === "string" && body.path.startsWith("/")) path = body.path;
  } catch {
    // no body — fall back to "/"
  }

  const deltas = { total: 1, [categorize(path)]: 1 };
  const day = new Date().toISOString().slice(0, 10);
  try {
    const token = await getAccessToken();
    const base = basePath();
    const write = (collection: string, id: string) => ({
      update: { name: `${base}/${collection}/${id}` },
      updateMask: { fieldPaths: [] },
      updateTransforms: Object.entries(deltas).map(([fieldPath, delta]) => ({
        fieldPath,
        increment: { integerValue: String(delta) },
      })),
    });
    const res = await fetch(`${FIRESTORE_HOST}/${base}:commit`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        writes: [write(DAILY_COLLECTION, day), write(TOTALS_COLLECTION, TOTALS_DOC)],
      }),
    });
    if (!res.ok) console.error("track-visit commit failed", res.status);
  } catch (err) {
    // best-effort analytics — never fail the visitor's request
    console.error("track-visit failed", err);
  }
  return Response.json({ ok: true });
}
