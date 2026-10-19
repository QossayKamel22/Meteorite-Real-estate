import { FIRESTORE_HOST, GOOGLE_REQUEST_TIMEOUT_MS, basePath, getAccessToken } from "@/lib/firestore-auth";
import { DEFAULT_FILMS } from "@/lib/project-film-defaults";
import { driveIdsIn } from "@/lib/project-film-shared";

const ID = /^[A-Za-z0-9_-]{10,}$/;
const ALLOW_TTL_MS = 60_000;
let allowed: { ids: Set<string>; at: number } | null = null;

/** The Drive files the site is configured to show: those in the saved project list (or the defaults if none was saved). */
async function allowedIds(): Promise<Set<string>> {
  if (allowed && Date.now() - allowed.at < ALLOW_TTL_MS) return allowed.ids;
  let ids: Set<string>;
  try {
    const token = await getAccessToken();
    const res = await fetch(`${FIRESTORE_HOST}/${basePath()}/settings/project-films?mask.fieldPaths=films`, {
      headers: { Authorization: `Bearer ${token}` },
      signal: AbortSignal.timeout(GOOGLE_REQUEST_TIMEOUT_MS),
    });
    if (res.status === 404) ids = new Set(driveIdsIn(JSON.stringify(DEFAULT_FILMS)));
    else if (res.ok) ids = new Set(driveIdsIn(await res.text()));
    else return allowed?.ids ?? new Set(driveIdsIn(JSON.stringify(DEFAULT_FILMS)));
  } catch {
    return allowed?.ids ?? new Set(driveIdsIn(JSON.stringify(DEFAULT_FILMS)));
  }
  allowed = { ids, at: Date.now() };
  return ids;
}

/**
 * GET /api/film/drive/<id>: streams a configured Google Drive video through the
 * site, honouring Range requests so the browser can play, loop and seek it. Google
 * blocks <video> tags that hot-link its download URL straight from a web page, but
 * answers a server-side request fine. Only files that appear in the saved project
 * list can be fetched — this is not an open proxy.
 */
export async function handleDriveVideo(request: Request, id: string): Promise<Response> {
  if (request.method !== "GET" && request.method !== "HEAD") {
    return new Response("Method Not Allowed", { status: 405, headers: { Allow: "GET, HEAD" } });
  }
  if (!ID.test(id) || !(await allowedIds()).has(id)) {
    return new Response("Not found", { status: 404, headers: { "Cache-Control": "public, max-age=60" } });
  }
  try {
    const range = request.headers.get("range");
    const upstream = await fetch(`https://drive.usercontent.google.com/download?id=${id}&export=download&confirm=t`, {
      method: request.method,
      headers: range ? { Range: range } : {},
      signal: AbortSignal.timeout(20_000),
    });
    const type = upstream.headers.get("content-type") ?? "";
    // Drive answers with an HTML page (quota exceeded, permission wall) instead of a video — don't pass that on as media.
    if ((upstream.status !== 200 && upstream.status !== 206) || !type.startsWith("video/")) {
      await upstream.body?.cancel();
      return new Response("Video unavailable", { status: 502, headers: { "Cache-Control": "no-store" } });
    }
    const headers = new Headers({
      "Content-Type": type,
      "Accept-Ranges": "bytes",
      "Cache-Control": "public, max-age=86400",
      "X-Content-Type-Options": "nosniff",
    });
    for (const h of ["content-length", "content-range"]) {
      const v = upstream.headers.get(h);
      if (v) headers.set(h, v);
    }
    return new Response(request.method === "HEAD" ? null : upstream.body, { status: upstream.status, headers });
  } catch (err) {
    console.error("drive video proxy failed", err);
    return new Response("Video unavailable", { status: 502, headers: { "Cache-Control": "no-store" } });
  }
}
