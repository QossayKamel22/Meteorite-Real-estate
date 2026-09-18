import "server-only";

/**
 * Minimal in-memory sliding-window rate limiter, keyed by an arbitrary
 * string (typically client IP). Suitable for a single Node instance —
 * it resets on restart and does not coordinate across instances, so a
 * multi-instance/serverless deployment needs a shared store (e.g. Redis)
 * for real protection instead.
 */
const attempts = new Map<string, number[]>();

const WINDOW_MS = 10 * 60 * 1000; // 10 minutes
const MAX_ATTEMPTS = 8;

export function isRateLimited(key: string): boolean {
  const now = Date.now();
  const timestamps = (attempts.get(key) ?? []).filter((t) => now - t < WINDOW_MS);

  if (timestamps.length >= MAX_ATTEMPTS) {
    attempts.set(key, timestamps);
    return true;
  }

  timestamps.push(now);
  attempts.set(key, timestamps);
  return false;
}

export function clearRateLimit(key: string): void {
  attempts.delete(key);
}

export function getClientKey(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  return forwarded?.split(",")[0].trim() ?? "unknown";
}
