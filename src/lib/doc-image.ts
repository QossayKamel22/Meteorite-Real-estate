import { FIRESTORE_HOST, basePath, getAccessToken, GOOGLE_REQUEST_TIMEOUT_MS } from "@/lib/firestore-auth";
import { getCfContext } from "@/lib/cf-runtime";
import { SAFE_DOC_ID, type ImageKind } from "@/lib/image-url";

type Target = { collection: string; field: string };

const TARGETS: Record<ImageKind, Target> = {
  agent: { collection: "agents", field: "photo" },
  certificate: { collection: "certificates", field: "image" },
  media: { collection: "mediaPosts", field: "image" },
  property: { collection: "properties", field: "image" },
  featured: { collection: "featuredProjects", field: "image" },
};

const NOT_FOUND = () => new Response("Not found", { status: 404, headers: { "Cache-Control": "public, max-age=60" } });

/**
 * Serves an admin-uploaded image (stored as a data URL on a Firestore document)
 * as a real image file. Runs in the edge middleware, so a visitor's image
 * request never loads the full Next server bundle, and pages reference images
 * by URL instead of inlining hundreds of KB of base64 into every cached copy.
 *
 * The URL carries ?v=<hash of the image>, so a response can be cached "forever";
 * replacing the image in the admin changes the URL. Responses are also kept in
 * the Cloudflare edge cache, so repeat views never touch Firestore.
 */
export async function handleDocImage(request: Request, kind: ImageKind, id: string): Promise<Response> {
  if (request.method !== "GET" && request.method !== "HEAD") {
    return new Response("Method Not Allowed", { status: 405, headers: { Allow: "GET, HEAD" } });
  }
  const target = TARGETS[kind];
  if (!target || !SAFE_DOC_ID.test(id)) return NOT_FOUND();

  const edgeCache = (globalThis as { caches?: { default?: Cache } }).caches?.default;
  try {
    if (edgeCache) {
      const hit = await edgeCache.match(request.url);
      if (hit) {
        const res = new Response(request.method === "HEAD" ? null : hit.body, hit);
        res.headers.set("X-Image-Cache", "HIT");
        return res;
      }
    }

    const token = await getAccessToken();
    const upstream = await fetch(
      `${FIRESTORE_HOST}/${basePath()}/${target.collection}/${id}?mask.fieldPaths=${target.field}`,
      { headers: { Authorization: `Bearer ${token}` }, signal: AbortSignal.timeout(GOOGLE_REQUEST_TIMEOUT_MS) }
    );
    if (upstream.status === 404) return NOT_FOUND();
    if (!upstream.ok) return new Response("Unavailable", { status: 502, headers: { "Cache-Control": "no-store" } });

    const doc = (await upstream.json()) as { fields?: Record<string, { stringValue?: string }> };
    const value = doc.fields?.[target.field]?.stringValue ?? "";
    const match = /^data:(image\/(?:jpeg|png|webp|gif));base64,(.+)$/.exec(value);
    if (!match) return NOT_FOUND();

    const binary = atob(match[2]);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);

    const headers = {
      "Content-Type": match[1],
      "Content-Length": String(bytes.length),
      "Cache-Control": "public, max-age=31536000, immutable",
      "X-Content-Type-Options": "nosniff",
    };

    if (edgeCache && request.method === "GET") {
      const put = edgeCache.put(request.url, new Response(bytes, { headers })).catch(() => undefined);
      const cf = getCfContext();
      if (cf) cf.ctx.waitUntil(put);
      else await put;
    }
    return new Response(request.method === "HEAD" ? null : bytes, { headers: { ...headers, "X-Image-Cache": "MISS" } });
  } catch (err) {
    console.error("doc-image failed", kind, err);
    return new Response("Unavailable", { status: 502, headers: { "Cache-Control": "no-store" } });
  }
}
