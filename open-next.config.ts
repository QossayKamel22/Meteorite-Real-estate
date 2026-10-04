import { defineCloudflareConfig } from "@opennextjs/cloudflare";
import type { IncrementalCache } from "@opennextjs/aws/types/overrides.js";
import kvIncrementalCache from "@opennextjs/cloudflare/overrides/incremental-cache/kv-incremental-cache";
import kvNextTagCache from "@opennextjs/cloudflare/overrides/tag-cache/kv-next-tag-cache";

// Prerendered pages are stored in Workers KV (free tier) and served straight
// from there, so a visit costs a KV read instead of a full React render plus a
// dozen Firestore calls — the Free plan gives a Worker only ~10ms of CPU per
// request. Admin edits call revalidatePath(); the KV tag cache marks the page
// stale and the next visit re-renders it once and stores the fresh copy
// (KV is eventually consistent, so an edit can take up to ~60s to appear).
//
// Cache interception serves a cache hit from the lightweight middleware layer
// without loading the large Next server bundle at all.
//
// Only finished pages are cached. Next's separate fetch ("data") cache is left
// off on purpose: it would key Firestore responses by URL + auth header, so a
// re-render after an admin edit could be handed a stale saved response — the
// site has always fetched Firestore fresh on every render and must keep doing so.
const pageOnlyKvCache: IncrementalCache = {
  name: kvIncrementalCache.name,
  get: (key, cacheType) => (cacheType === "fetch" ? Promise.resolve(null) : kvIncrementalCache.get(key, cacheType)),
  set: (key, value, cacheType) => (cacheType === "fetch" ? Promise.resolve() : kvIncrementalCache.set(key, value, cacheType)),
  delete: (key) => kvIncrementalCache.delete(key),
};

export default defineCloudflareConfig({
  incrementalCache: pageOnlyKvCache,
  tagCache: kvNextTagCache,
  enableCacheInterception: true,
});
