// Pure TypeScript with no imports so it can be unit-tested directly with Node.

/**
 * Turns a link pasted in the admin into the URL of an embeddable player.
 * Accepts a Google Drive share link (/file/d/<id>/view, open?id=<id>, uc?id=<id>),
 * a YouTube watch/short link or a Vimeo link; anything else returns null.
 */
export function getFilmEmbedUrl(url: string): string | null {
  try {
    const u = new URL(url.trim());
    if (u.protocol !== "https:") return null;
    const host = u.hostname.replace(/^www\./, "");
    if (host === "drive.google.com") {
      const id = u.pathname.match(/^\/file\/d\/([A-Za-z0-9_-]{10,})/)?.[1] ?? u.searchParams.get("id") ?? "";
      return /^[A-Za-z0-9_-]{10,}$/.test(id) ? `https://drive.google.com/file/d/${id}/preview` : null;
    }
    if (host === "youtu.be" || host === "youtube.com" || host === "m.youtube.com") {
      const id =
        host === "youtu.be" ? u.pathname.slice(1) : u.pathname.startsWith("/shorts/") ? u.pathname.slice(8) : u.searchParams.get("v") ?? "";
      return /^[A-Za-z0-9_-]{6,15}$/.test(id) ? `https://www.youtube-nocookie.com/embed/${id}` : null;
    }
    if (host === "vimeo.com") {
      const id = u.pathname.split("/").filter(Boolean).pop() ?? "";
      return /^\d+$/.test(id) ? `https://player.vimeo.com/video/${id}` : null;
    }
    return null;
  } catch {
    return null;
  }
}

export type FilmFact = { value: string; label: string };

export type ProjectFilm = {
  visible: boolean;
  kicker: string;
  title: string;
  location: string;
  description: string;
  facts: FilmFact[];
  /** A Google Drive share link, or a YouTube / Vimeo link. */
  videoUrl: string;
};

export const FILM_LIMITS = { kicker: 40, title: 90, location: 80, description: 700, factValue: 24, factLabel: 40, videoUrl: 500 } as const;
export const MAX_FILM_FACTS = 4;

type Result = { ok: true; value: ProjectFilm } | { ok: false; error: string };

function text(v: unknown, max: number): string | null {
  if (typeof v !== "string") return null;
  const t = v.replace(/\r\n/g, "\n").trim();
  return t.length <= max ? t : null;
}

/** Validates and normalises an admin submission. Never trusts the client. */
export function parseProjectFilm(body: unknown): Result {
  if (!body || typeof body !== "object") return { ok: false, error: "Invalid request." };
  const b = body as Record<string, unknown>;
  if (typeof b.visible !== "boolean") return { ok: false, error: "Visibility must be on or off." };

  const kicker = text(b.kicker ?? "", FILM_LIMITS.kicker);
  if (kicker === null) return { ok: false, error: `Label must be ${FILM_LIMITS.kicker} characters or fewer.` };
  const title = text(b.title, FILM_LIMITS.title);
  if (!title) return { ok: false, error: `Title is required (max ${FILM_LIMITS.title} characters).` };
  const location = text(b.location ?? "", FILM_LIMITS.location);
  if (location === null) return { ok: false, error: `Location must be ${FILM_LIMITS.location} characters or fewer.` };
  const description = text(b.description ?? "", FILM_LIMITS.description);
  if (description === null) return { ok: false, error: `Description must be ${FILM_LIMITS.description} characters or fewer.` };

  const raw = b.facts ?? [];
  if (!Array.isArray(raw) || raw.length > MAX_FILM_FACTS) return { ok: false, error: `You can add up to ${MAX_FILM_FACTS} key facts.` };
  const facts: FilmFact[] = [];
  for (const f of raw) {
    const value = text((f as FilmFact)?.value ?? "", FILM_LIMITS.factValue);
    const label = text((f as FilmFact)?.label ?? "", FILM_LIMITS.factLabel);
    if (value === null || label === null) return { ok: false, error: "A key fact is too long." };
    if (!value && !label) continue;
    if (!value || !label) return { ok: false, error: "Each key fact needs both a figure and a label." };
    facts.push({ value, label });
  }

  const videoUrl = text(b.videoUrl, FILM_LIMITS.videoUrl);
  if (!videoUrl || !getFilmEmbedUrl(videoUrl)) {
    return { ok: false, error: "Paste a Google Drive share link (or a YouTube / Vimeo link) for the video." };
  }
  return { ok: true, value: { visible: b.visible, kicker: kicker || "Project Film", title, location, description, facts, videoUrl } };
}
