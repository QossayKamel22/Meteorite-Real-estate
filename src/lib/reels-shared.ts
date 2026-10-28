// Pure TypeScript with no imports, so it is shared by the server, the admin form and the
// public section, and can be unit-tested directly with Node.

export type ReelPlatform = "tiktok" | "instagram" | "youtube" | "facebook";

export type Reel = {
  id: string;
  platform: ReelPlatform;
  /** The original public link, always https. */
  url: string;
  title: string;
  /** Optional cover picture: an uploaded image served by the site, or an https link. "" = a designed poster is used. */
  cover: string;
  visible: boolean;
  order: number;
};

export const REEL_LIMITS = { url: 500, title: 100, cover: 300 } as const;
export const MAX_REELS = 40;

export const PLATFORM_LABEL: Record<ReelPlatform, string> = {
  tiktok: "TikTok",
  instagram: "Instagram",
  youtube: "YouTube",
  facebook: "Facebook",
};

export type ParsedReel =
  | { ok: true; platform: ReelPlatform; url: string; id: string }
  /** A short/share link: it has to be opened once (server side) to find the real address. */
  | { ok: false; resolve: true }
  | { ok: false; resolve?: false };

const SHORT_HOSTS = new Set(["vm.tiktok.com", "vt.tiktok.com", "fb.watch"]);

/** Works out which platform a pasted link belongs to and the id its player needs. */
export function parseReelUrl(input: string): ParsedReel {
  let u: URL;
  try {
    u = new URL(input.trim());
  } catch {
    return { ok: false };
  }
  if (u.protocol !== "https:") return { ok: false };
  const host = u.hostname.toLowerCase().replace(/^(www|m|web)\./, "");
  const path = u.pathname.replace(/\/+$/, "");

  if (SHORT_HOSTS.has(host)) return { ok: false, resolve: true };

  if (host === "tiktok.com") {
    if (/^\/t\/[A-Za-z0-9]+$/.test(path)) return { ok: false, resolve: true };
    const m = path.match(/^\/@[A-Za-z0-9._-]+\/video\/(\d{8,25})$/) ?? path.match(/^\/(?:embed\/v2|player\/v1)\/(\d{8,25})$/);
    if (m) return { ok: true, platform: "tiktok", id: m[1], url: `https://www.tiktok.com${path.startsWith("/@") ? path : `/video/${m[1]}`}` };
    return { ok: false };
  }

  if (host === "youtube.com" || host === "youtu.be" || host === "youtube-nocookie.com") {
    let id = "";
    if (host === "youtu.be") id = path.slice(1);
    else if (path.startsWith("/shorts/")) id = path.slice(8);
    else if (path.startsWith("/embed/")) id = path.slice(7);
    else id = u.searchParams.get("v") ?? "";
    if (!/^[A-Za-z0-9_-]{6,15}$/.test(id)) return { ok: false };
    return { ok: true, platform: "youtube", id, url: path.startsWith("/shorts/") ? `https://www.youtube.com/shorts/${id}` : `https://www.youtube.com/watch?v=${id}` };
  }

  if (host === "instagram.com") {
    const m = path.match(/^\/(?:[A-Za-z0-9._]+\/)?(reel|reels|p|tv)\/([A-Za-z0-9_-]{5,20})$/);
    if (!m) return { ok: false };
    const kind = m[1] === "reels" ? "reel" : m[1];
    return { ok: true, platform: "instagram", id: `${kind}/${m[2]}`, url: `https://www.instagram.com/${kind}/${m[2]}/` };
  }

  if (host === "facebook.com" || host === "fb.com") {
    const reel = path.match(/^\/reel\/(\d{5,25})$/);
    const watch = path === "/watch" && /^\d{5,25}$/.test(u.searchParams.get("v") ?? "") ? u.searchParams.get("v") : null;
    const video = path.match(/^\/[A-Za-z0-9._-]+\/videos\/(?:[^/]+\/)?(\d{5,25})$/);
    if (/^\/share\/(?:r|v)\/[A-Za-z0-9]+$/.test(path)) return { ok: false, resolve: true };
    const id = reel?.[1] ?? watch ?? video?.[1];
    if (!id) return { ok: false };
    const canonical = reel ? `https://www.facebook.com/reel/${id}` : `https://www.facebook.com${path}${watch ? `?v=${id}` : ""}`;
    return { ok: true, platform: "facebook", id, url: canonical };
  }

  return { ok: false };
}

/** The iframe address of a reel's player. Always derived from the link — never trusted from storage. */
export function reelEmbedSrc(platform: ReelPlatform, url: string, autoplay: boolean): string | null {
  const p = parseReelUrl(url);
  if (!p.ok || p.platform !== platform) return null;
  const play = autoplay ? 1 : 0;
  switch (platform) {
    case "tiktok":
      return `https://www.tiktok.com/player/v1/${p.id}?music_info=0&description=0&autoplay=${play}&muted=1&loop=1&controls=1&progress_bar=1&play_button=1&volume_control=1&fullscreen_button=0&timestamp=0&rel=0`;
    case "youtube":
      return `https://www.youtube-nocookie.com/embed/${p.id}?autoplay=${play}&mute=1&loop=1&playlist=${p.id}&playsinline=1&rel=0&modestbranding=1`;
    case "instagram":
      return `https://www.instagram.com/${p.id}/embed/`;
    case "facebook":
      return `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(p.url)}&show_text=false&autoplay=${autoplay ? "true" : "false"}&width=380`;
  }
}

/** A poster picture YouTube publishes for every video; the other platforms don't offer one. */
export function autoCover(platform: ReelPlatform, url: string): string {
  const p = parseReelUrl(url);
  return p.ok && platform === "youtube" ? `https://i.ytimg.com/vi/${p.id}/hqdefault.jpg` : "";
}

export function isReelCover(v: string): boolean {
  if (/^\/api\/img\/film\/[A-Za-z0-9_-]{1,64}$/.test(v)) return true;
  try {
    const u = new URL(v);
    return u.protocol === "https:" && u.hostname.includes(".");
  } catch {
    return false;
  }
}

type Fields = { ok: true; value: { url: string; platform: ReelPlatform; title: string; cover: string; visible: boolean } } | { ok: false; error: string };

/** Validates a reel submitted from the admin. The title is optional; only a working link is required. */
export function parseReelFields(body: unknown): Fields {
  if (!body || typeof body !== "object") return { ok: false, error: "Invalid request." };
  const b = body as Record<string, unknown>;
  const rawUrl = typeof b.url === "string" ? b.url.trim() : "";
  if (!rawUrl || rawUrl.length > REEL_LIMITS.url) return { ok: false, error: "Paste the link of the reel or video." };
  const p = parseReelUrl(rawUrl);
  if (!p.ok) {
    return {
      ok: false,
      error: p.resolve
        ? "That's a short link — open it in your browser and paste the full address instead."
        : "That isn't a TikTok, Instagram, YouTube or Facebook video link.",
    };
  }
  const title = typeof b.title === "string" ? b.title.replace(/\s+/g, " ").trim() : "";
  if (title.length > REEL_LIMITS.title) return { ok: false, error: `The title must be ${REEL_LIMITS.title} characters or fewer.` };
  const cover = typeof b.cover === "string" ? b.cover.trim() : "";
  if (cover && (cover.length > REEL_LIMITS.cover || !isReelCover(cover))) return { ok: false, error: "The cover must be an uploaded image or an https link." };
  const visible = b.visible === undefined ? true : b.visible;
  if (typeof visible !== "boolean") return { ok: false, error: "Visibility must be on or off." };
  return { ok: true, value: { url: p.url, platform: p.platform, title, cover, visible } };
}

export type SocialAccounts = { tiktok: string; youtube: string };

/** Validates the account links edited next to the reels; an empty value hides that link. */
export function parseSocialAccounts(body: unknown): { ok: true; value: SocialAccounts } | { ok: false; error: string } {
  const b = (body ?? {}) as Record<string, unknown>;
  const check = (v: unknown, hosts: RegExp): string | null => {
    const s = typeof v === "string" ? v.trim() : "";
    if (!s) return "";
    try {
      const u = new URL(s);
      return u.protocol === "https:" && hosts.test(u.hostname.replace(/^www\./, "")) && s.length <= 300 ? s : null;
    } catch {
      return null;
    }
  };
  const tiktok = check(b.tiktok, /^tiktok\.com$/);
  const youtube = check(b.youtube, /^(youtube\.com|youtu\.be)$/);
  if (tiktok === null) return { ok: false, error: "The TikTok link must be your https://www.tiktok.com/@name page." };
  if (youtube === null) return { ok: false, error: "The YouTube link must be an https://www.youtube.com/… address." };
  return { ok: true, value: { tiktok, youtube } };
}
