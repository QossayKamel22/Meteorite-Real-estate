// Runs between `opennextjs-cloudflare build` and `deploy` (see package.json).
//
// Two things are removed from the cache before it is uploaded to KV:
//  1. `__fetch/` — Next's saved fetch responses from the build (Firestore reads
//     and even Google OAuth token responses). The runtime never reads them (see
//     open-next.config.ts) and they would only waste KV writes.
//  2. `segmentData` inside each page entry, described below.
//
// Next stores a `segmentData` blob (per-segment prefetch payloads, ~40% of each
// entry) alongside every prerendered page. It is only read when the browser
// issues a segment *prefetch* request, which this site never does (every <Link>
// has prefetch={false}). The Worker has to JSON-parse the whole cache entry on
// every hit, and the Free plan allows ~10ms of CPU per request, so shipping the
// unused blob costs real CPU. Drop it before the cache is uploaded to KV.
import fs from "node:fs";
import path from "node:path";

const root = path.join(".open-next", "cache");
let files = 0;
let before = 0;
let after = 0;

if (!fs.existsSync(root)) {
  console.error(`strip-segment-data: ${root} not found — run the OpenNext build first`);
  process.exit(1);
}
const fetchDir = path.join(root, "__fetch");
if (fs.existsSync(fetchDir)) {
  fs.rmSync(fetchDir, { recursive: true, force: true });
  console.log("strip-segment-data: removed build-time fetch cache (__fetch)");
}

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(full);
    } else if (entry.name.endsWith(".cache")) {
      const raw = fs.readFileSync(full, "utf8");
      let json;
      try {
        json = JSON.parse(raw);
      } catch {
        continue;
      }
      const target = json && typeof json === "object" && json.value ? json.value : json;
      if (target && typeof target === "object" && "segmentData" in target) {
        delete target.segmentData;
        const out = JSON.stringify(json);
        fs.writeFileSync(full, out);
        files++;
        before += raw.length;
        after += out.length;
      }
    }
  }
}

walk(root);
console.log(`strip-segment-data: trimmed ${files} cache entries, ${(before / 1024).toFixed(0)}KB -> ${(after / 1024).toFixed(0)}KB`);
