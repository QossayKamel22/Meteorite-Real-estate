import "server-only";
import { isRateLimited as isRateLimitedInMemory } from "@/lib/rate-limit";

type Cache = { match(req: Request): Promise<Response | undefined>; put(req: Request, res: Response): Promise<void> };

/**
 * A rate limit that holds across requests on Cloudflare: each visitor's count lives in the data centre's
 * Cache API (free, no KV write quota) for the length of the window. The in-memory limiter is only the
 * fallback when no edge cache exists (local `next start`). A count is per data centre, which is exactly
 * what limits one person hammering the form.
 */
export async function isRateLimitedEdge(key: string, max: number, windowSeconds: number): Promise<boolean> {
  const cache = (globalThis as { caches?: { default?: Cache } }).caches?.default;
  if (!cache) return isRateLimitedInMemory(key);
  try {
    const bytes = new TextEncoder().encode(key);
    const digest = await crypto.subtle.digest("SHA-256", bytes);
    const hex = [...new Uint8Array(digest)].slice(0, 12).map((b) => b.toString(16).padStart(2, "0")).join("");
    const req = new Request(`https://rate-limit.internal/${hex}`);
    const hit = await cache.match(req);
    const count = hit ? Number((await hit.json().catch(() => ({ n: 0 }))).n ?? 0) : 0;
    if (count >= max) return true;
    await cache.put(req, new Response(JSON.stringify({ n: count + 1 }), { headers: { "Cache-Control": `public, max-age=${windowSeconds}`, "Content-Type": "application/json" } }));
    return false;
  } catch {
    return isRateLimitedInMemory(key);
  }
}
