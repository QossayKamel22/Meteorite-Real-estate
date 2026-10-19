import { getCfContext } from "@/lib/cf-runtime";

const PATH = /^[A-Za-z0-9._\-/]+\.(mp4|webm)$/i;

type AssetsBinding = { fetch(input: Request | string): Promise<Response> };

/**
 * GET /api/film/file/<path>: serves a bundled video (/brand/<path>) WITH byte-range
 * support. The static-asset layer answers every request with the whole file and no
 * Accept-Ranges, which stops browsers from seeking — and a looping video has to seek
 * back to the start. The first request copies the file into the Cloudflare edge cache
 * (as a normal, range-capable object); every later request, including each Range
 * request, is answered from there as a 206.
 *
 * Outside a Worker (local `next start`) there is no edge cache; the request falls
 * through (null) and the browser is sent to the plain file.
 */
export async function handleBundledVideo(request: Request, subPath: string): Promise<Response | null> {
  if (request.method !== "GET" && request.method !== "HEAD") {
    return new Response("Method Not Allowed", { status: 405, headers: { Allow: "GET, HEAD" } });
  }
  if (!PATH.test(subPath) || subPath.includes("..") || subPath.includes("//") || subPath.startsWith("/")) {
    return new Response("Not found", { status: 404, headers: { "Cache-Control": "public, max-age=60" } });
  }
  const cache = (globalThis as { caches?: { default?: Cache } }).caches?.default;
  const cf = getCfContext();
  if (!cache || !cf) return null;

  // The cache key never carries a Range header, so one stored copy serves every range.
  const url = new URL(request.url);
  const key = new Request(`${url.origin}/api/film/file/${subPath}`);
  const hit = await cache.match(request);
  if (hit) return hit;

  const assets = cf.env.ASSETS as AssetsBinding | undefined;
  const source = `${url.origin}/brand/${subPath}`;
  const full = assets ? await assets.fetch(new Request(source)) : await fetch(source);
  if (!full.ok || !full.body) return new Response("Not found", { status: 404, headers: { "Cache-Control": "public, max-age=60" } });

  const headers = new Headers({
    "Content-Type": subPath.toLowerCase().endsWith(".webm") ? "video/webm" : "video/mp4",
    "Accept-Ranges": "bytes",
    "Cache-Control": "public, max-age=31536000, immutable",
    "X-Content-Type-Options": "nosniff",
  });
  const length = full.headers.get("content-length");
  if (length) headers.set("Content-Length", length);

  const [toCache, toClient] = full.body.tee();
  cf.ctx.waitUntil(cache.put(key, new Response(toCache, { headers })).catch(() => undefined));
  return new Response(request.method === "HEAD" ? null : toClient, { headers });
}
