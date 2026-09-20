import { defineCloudflareConfig } from "@opennextjs/cloudflare";

// No incrementalCache override configured: this app has no ISR (pages are
// either static or force-dynamic), so the default in-memory cache is fine —
// no R2 bucket needed.
export default defineCloudflareConfig();
