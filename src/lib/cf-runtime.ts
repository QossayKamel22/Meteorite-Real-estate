// Access to the Cloudflare request context (bindings + waitUntil) from code that
// also has to run outside a Worker (local `next start`, build). OpenNext exposes
// the current request's context on this well-known global; reading it directly
// avoids bundling the adapter package into the edge middleware.

export type CfContext = {
  env: Record<string, unknown>;
  ctx: { waitUntil(promise: Promise<unknown>): void };
};

export function getCfContext(): CfContext | null {
  try {
    const ctx = (globalThis as Record<symbol, unknown>)[Symbol.for("__cloudflare-context__")];
    return ctx && typeof ctx === "object" ? (ctx as CfContext) : null;
  } catch {
    return null;
  }
}

/** Minimal shape of the KV namespace methods we use. */
export type KvLike = {
  get(key: string, type: "json"): Promise<unknown>;
  put(key: string, value: string, opts?: { expirationTtl?: number }): Promise<void>;
};

export function getKv(binding: string): KvLike | null {
  const kv = getCfContext()?.env?.[binding];
  return kv && typeof (kv as KvLike).get === "function" ? (kv as KvLike) : null;
}
