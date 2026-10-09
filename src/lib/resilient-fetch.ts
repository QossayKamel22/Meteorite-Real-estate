// Pure (no server-only imports, relative imports only) so the retry rules can be
// unit-tested with a fake fetch.

const RETRYABLE_STATUS = new Set([429, 500, 502, 503, 504]);

export type ResilientFetchOptions = {
  getToken: () => Promise<string>;
  invalidateToken: () => void;
  timeoutMs: number;
  /** Injected for tests; defaults to the global fetch / a real timer. */
  fetchImpl?: typeof fetch;
  sleepImpl?: (ms: number) => Promise<void>;
};

/**
 * One authenticated Google API call, hardened for a Worker:
 *  - every attempt has a hard timeout (no request hangs on a stalled connection);
 *  - reads (GET) retry once on a network error, timeout or a 429/5xx — they're idempotent;
 *  - a 401 (stale cached token) mints a fresh token and retries once;
 *  - writes are never blindly retried (a retried non-idempotent write could double-apply).
 */
export async function resilientFetch(url: string, init: RequestInit | undefined, opts: ResilientFetchOptions): Promise<Response> {
  const doFetch = opts.fetchImpl ?? fetch;
  const sleep = opts.sleepImpl ?? ((ms: number) => new Promise<void>((r) => setTimeout(r, ms)));
  const isRead = (init?.method ?? "GET").toUpperCase() === "GET";
  let refreshedToken = false;

  for (let attempt = 1; ; attempt++) {
    const token = await opts.getToken();
    try {
      const res = await doFetch(url, {
        ...init,
        headers: {
          ...(init?.headers ?? {}),
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        signal: AbortSignal.timeout(opts.timeoutMs),
      });

      if (res.status === 401 && !refreshedToken) {
        refreshedToken = true;
        opts.invalidateToken();
        await res.body?.cancel();
        continue;
      }
      if (isRead && attempt < 2 && RETRYABLE_STATUS.has(res.status)) {
        await res.body?.cancel();
        await sleep(250);
        continue;
      }
      return res;
    } catch (err) {
      if (isRead && attempt < 2) {
        await sleep(250);
        continue;
      }
      throw err;
    }
  }
}
