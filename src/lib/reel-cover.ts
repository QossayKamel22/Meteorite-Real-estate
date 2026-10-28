import { addDoc } from "@/lib/firestore-rest";

const MAX_BYTES = 330_000;

/**
 * Instagram will not play a reel inside another site, so its card shows the reel's
 * own cover picture instead. The cover is read from the public embed page, copied
 * into our own storage (Instagram's picture links expire) and its served URL returned.
 * Returns "" when it can't be read — the card then falls back to the branded poster.
 */
export async function fetchInstagramCover(reelUrl: string): Promise<string> {
  try {
    const u = new URL(reelUrl);
    if (u.hostname !== "www.instagram.com") return "";
    const page = await fetch(`${u.origin}${u.pathname.replace(/\/?$/, "/")}embed/`, {
      headers: { "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/124.0 Safari/537.36" },
      signal: AbortSignal.timeout(8000),
    });
    if (!page.ok) return "";
    const html = await page.text();
    const m = html.match(/class="EmbeddedMediaImage"[^>]*?\ssrc="([^"]+)"/) ?? html.match(/\ssrc="([^"]+)"[^>]*class="EmbeddedMediaImage"/);
    if (!m) return "";
    const src = m[1].replace(/&amp;/g, "&");
    const host = new URL(src).hostname;
    if (!/\.(fbcdn\.net|cdninstagram\.com)$/.test(host)) return "";
    const img = await fetch(src, { signal: AbortSignal.timeout(8000) });
    const type = img.headers.get("content-type") ?? "";
    if (!img.ok || !/^image\/(jpeg|png|webp)$/.test(type)) return "";
    const buf = new Uint8Array(await img.arrayBuffer());
    if (buf.length === 0 || buf.length > MAX_BYTES) return "";
    let bin = "";
    for (let i = 0; i < buf.length; i += 0x8000) bin += String.fromCharCode(...buf.subarray(i, i + 0x8000));
    const id = await addDoc("filmImages", { image: `data:${type};base64,${btoa(bin)}`, createdAt: new Date().toISOString() });
    return `/api/img/film/${id}`;
  } catch {
    return "";
  }
}
