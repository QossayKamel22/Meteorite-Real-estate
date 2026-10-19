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

/** One picture in a film's strip. `ratio` is width / height, so the strip can lay it out without cropping. */
export type FilmImage = { src: string; alt: string; ratio: number };

export type ProjectFilm = {
  /** Stable id (also the page anchor). */
  id: string;
  visible: boolean;
  kicker: string;
  title: string;
  location: string;
  description: string;
  facts: FilmFact[];
  /** A Google Drive share link, or a YouTube / Vimeo link. */
  videoUrl: string;
  /** Shown in the player frame until the video has loaded. A bundled /brand/ file or an https link, or "". */
  poster: string;
  images: FilmImage[];
};

export const FILM_LIMITS = { kicker: 40, title: 90, location: 80, description: 700, factValue: 24, factLabel: 40, videoUrl: 500, alt: 140 } as const;
export const MAX_FILM_FACTS = 4;
export const MAX_FILMS = 8;
export const MAX_FILM_IMAGES = 16;

const ID = /^[A-Za-z0-9_-]{1,64}$/;

/** A bundled file under /brand/ (no path tricks) or an https link. */
export function isFilmImageSrc(v: string): boolean {
  if (/^\/brand\/[A-Za-z0-9._\-/]+$/.test(v) && !v.includes("..") && !v.includes("//")) return true;
  try {
    const u = new URL(v);
    return u.protocol === "https:" && u.hostname.includes(".");
  } catch {
    return false;
  }
}

type Result<T> = { ok: true; value: T } | { ok: false; error: string };

function text(v: unknown, max: number): string | null {
  if (typeof v !== "string") return null;
  const t = v.replace(/\r\n/g, "\n").trim();
  return t.length <= max ? t : null;
}

/** Validates and normalises ONE film. Never trusts the client. */
export function parseProjectFilm(body: unknown): Result<ProjectFilm> {
  if (!body || typeof body !== "object") return { ok: false, error: "Invalid request." };
  const b = body as Record<string, unknown>;
  const id = typeof b.id === "string" ? b.id : "";
  if (!ID.test(id)) return { ok: false, error: "Invalid project id." };
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

  const poster = typeof b.poster === "string" ? b.poster.trim() : "";
  if (poster && !isFilmImageSrc(poster)) return { ok: false, error: "The poster must be a bundled image or an https link." };

  const rawImages = b.images ?? [];
  if (!Array.isArray(rawImages) || rawImages.length > MAX_FILM_IMAGES) {
    return { ok: false, error: `A project can show up to ${MAX_FILM_IMAGES} gallery images.` };
  }
  const images: FilmImage[] = [];
  for (const im of rawImages) {
    const src = typeof (im as FilmImage)?.src === "string" ? (im as FilmImage).src.trim() : "";
    const alt = text((im as FilmImage)?.alt ?? "", FILM_LIMITS.alt);
    const ratio = Number((im as FilmImage)?.ratio);
    if (!isFilmImageSrc(src) || alt === null || !Number.isFinite(ratio) || ratio < 0.25 || ratio > 4) {
      return { ok: false, error: "A gallery image is invalid." };
    }
    images.push({ src, alt, ratio: Math.round(ratio * 1000) / 1000 });
  }

  return { ok: true, value: { id, visible: b.visible, kicker: kicker || "Project Film", title, location, description, facts, videoUrl, poster, images } };
}

/** Validates the whole list the admin form submits. Ids must be unique. */
export function parseProjectFilms(body: unknown): Result<ProjectFilm[]> {
  const list = (body as { films?: unknown } | null)?.films;
  if (!Array.isArray(list)) return { ok: false, error: "Invalid request." };
  if (list.length > MAX_FILMS) return { ok: false, error: `You can have up to ${MAX_FILMS} project films.` };
  const films: ProjectFilm[] = [];
  const seen = new Set<string>();
  for (const [i, item] of list.entries()) {
    const r = parseProjectFilm(item);
    if (!r.ok) return { ok: false, error: list.length > 1 ? `Project ${i + 1}: ${r.error}` : r.error };
    if (seen.has(r.value.id)) return { ok: false, error: "Duplicate project id." };
    seen.add(r.value.id);
    films.push(r.value);
  }
  return { ok: true, value: films };
}
