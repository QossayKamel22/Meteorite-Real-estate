// Shared by the server (data layer + API validation), the admin form and the
// public section. Pure TypeScript with only relative imports, so it can also be
// unit-tested directly with Node.

export type FeaturedFact = { value: string; label: string };

export type FeaturedProject = {
  /** Hidden when false — the section is simply not rendered. */
  visible: boolean;
  kicker: string;
  name: string;
  location: string;
  description: string;
  /** Up to MAX_FACTS short figures, e.g. { value: "77", label: "Curated homes" }. */
  facts: FeaturedFact[];
  /** Where "Explore the project" goes. Always https. */
  linkUrl: string;
  linkLabel: string;
  /** "" (none), an https URL, or a data:image/... URL uploaded in the admin. */
  image: string;
  /** Changes whenever the image does; used to cache-bust the served image. */
  imageVersion: number;
};

export type FeaturedProjectInput = Omit<FeaturedProject, "imageVersion">;

export const FEATURED_LIMITS = {
  kicker: 40,
  name: 80,
  location: 80,
  description: 600,
  factValue: 40,
  factLabel: 40,
  linkUrl: 500,
  linkLabel: 40,
  image: 700_000,
} as const;
export const MAX_FACTS = 4;

const DATA_IMAGE = /^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/]+=*$/;

export function isHttpsUrl(value: string): boolean {
  try {
    const u = new URL(value);
    return u.protocol === "https:" && u.hostname.includes(".");
  } catch {
    return false;
  }
}

/** The URL the public page should load the image from (never inline base64). */
export function featuredImageSrc(p: Pick<FeaturedProject, "image" | "imageVersion">): string | null {
  if (!p.image) return null;
  if (p.image.startsWith("data:")) return `/api/featured-project/image?v=${p.imageVersion}`;
  return p.image;
}

type Result = { ok: true; value: FeaturedProjectInput } | { ok: false; error: string };

function text(v: unknown, max: number): string | null {
  if (typeof v !== "string") return null;
  const t = v.replace(/\r\n/g, "\n").trim();
  return t.length <= max ? t : null;
}

/** Validates and normalises an admin submission. Never trusts the client. */
export function parseFeaturedProject(body: unknown): Result {
  if (!body || typeof body !== "object") return { ok: false, error: "Invalid request." };
  const b = body as Record<string, unknown>;

  if (typeof b.visible !== "boolean") return { ok: false, error: "Visibility must be on or off." };

  const kicker = text(b.kicker ?? "", FEATURED_LIMITS.kicker);
  if (kicker === null) return { ok: false, error: `Label must be ${FEATURED_LIMITS.kicker} characters or fewer.` };

  const name = text(b.name, FEATURED_LIMITS.name);
  if (!name) return { ok: false, error: `Project name is required (max ${FEATURED_LIMITS.name} characters).` };

  const location = text(b.location ?? "", FEATURED_LIMITS.location);
  if (location === null) return { ok: false, error: `Location must be ${FEATURED_LIMITS.location} characters or fewer.` };

  const description = text(b.description ?? "", FEATURED_LIMITS.description);
  if (description === null) {
    return { ok: false, error: `Description must be ${FEATURED_LIMITS.description} characters or fewer.` };
  }

  const rawFacts = b.facts ?? [];
  if (!Array.isArray(rawFacts) || rawFacts.length > MAX_FACTS) {
    return { ok: false, error: `You can add up to ${MAX_FACTS} key facts.` };
  }
  const facts: FeaturedFact[] = [];
  for (const f of rawFacts) {
    const value = text((f as FeaturedFact)?.value ?? "", FEATURED_LIMITS.factValue);
    const label = text((f as FeaturedFact)?.label ?? "", FEATURED_LIMITS.factLabel);
    if (value === null || label === null) {
      return { ok: false, error: `Key facts must be ${FEATURED_LIMITS.factValue} characters or fewer.` };
    }
    if (!value && !label) continue; // ignore fully blank rows
    if (!value || !label) return { ok: false, error: "Each key fact needs both a figure and a label." };
    facts.push({ value, label });
  }

  const linkUrl = text(b.linkUrl, FEATURED_LIMITS.linkUrl);
  if (!linkUrl || !isHttpsUrl(linkUrl)) {
    return { ok: false, error: "Project link must be a valid https:// address." };
  }

  const linkLabel = text(b.linkLabel ?? "", FEATURED_LIMITS.linkLabel);
  if (linkLabel === null) return { ok: false, error: `Button text must be ${FEATURED_LIMITS.linkLabel} characters or fewer.` };

  const image = typeof b.image === "string" ? b.image.trim() : "";
  if (image.length > FEATURED_LIMITS.image) return { ok: false, error: "That image is too large. Try a smaller one." };
  if (image && !isHttpsUrl(image) && !DATA_IMAGE.test(image)) {
    return { ok: false, error: "The image must be an uploaded JPG/PNG/WebP or an https:// link." };
  }

  return {
    ok: true,
    value: {
      visible: b.visible,
      kicker: kicker || "Featured Project",
      name,
      location,
      description,
      facts,
      linkUrl,
      linkLabel: linkLabel || "Explore the project",
      image,
    },
  };
}
