import "server-only";
import { addDoc, commitWrites, deleteDoc, getDoc, listCollection, setDocMerge } from "@/lib/firestore-rest";
import { publicImageSrc } from "@/lib/image-url";
import {
  MAX_PROJECTS,
  type FeaturedProject,
  type FeaturedProjectInput,
} from "@/lib/featured-project-shared";

const COLLECTION = "featuredProjects";
const SEED_MARKER_COLLECTION = "_meta";
const SEED_MARKER_ID = "featuredProjectsSeeded";
const LEGACY_COLLECTION = "settings";
const LEGACY_ID = "featured-project";

/**
 * Shown until an admin edits it. Every fact here is taken from the project's
 * own website (forumresidences.com): name, location, developer, home count,
 * unit types and listed amenities. No photo is bundled — the developer's
 * artwork isn't ours to republish — so the card renders a typographic panel
 * until an image is uploaded in the admin.
 */
export const DEFAULT_PROJECT: FeaturedProjectInput = {
  visible: true,
  kicker: "Featured Project",
  name: "Forum II",
  location: "Majan, Dubai",
  description:
    "A community-centred address with direct E311 access, designed around warm natural materials, calm interiors and a refined, residential feel. Residents have a rooftop infinity pool, a fitness centre, a private sauna, 24/7 security and a dedicated concierge.",
  facts: [
    { value: "77", label: "Curated homes" },
    { value: "Studio – 2 BR", label: "Residences" },
    { value: "K x G", label: "Developer" },
  ],
  linkUrl: "https://www.forumresidences.com/",
  linkLabel: "Explore the project",
  image: "",
};

function normalise(data: Record<string, unknown>): FeaturedProjectInput {
  const d = data as Partial<FeaturedProjectInput>;
  const facts = Array.isArray(d.facts)
    ? d.facts.filter(
        (f): f is { value: string; label: string } => typeof f?.value === "string" && typeof f?.label === "string"
      )
    : [];
  return {
    visible: typeof d.visible === "boolean" ? d.visible : true,
    kicker: typeof d.kicker === "string" && d.kicker ? d.kicker : DEFAULT_PROJECT.kicker,
    name: typeof d.name === "string" ? d.name : "",
    location: typeof d.location === "string" ? d.location : "",
    description: typeof d.description === "string" ? d.description : "",
    facts,
    linkUrl: typeof d.linkUrl === "string" ? d.linkUrl : "",
    linkLabel: typeof d.linkLabel === "string" && d.linkLabel ? d.linkLabel : DEFAULT_PROJECT.linkLabel,
    image: typeof d.image === "string" ? d.image : "",
  };
}

// Once the seed marker has been seen, never re-check it for the life of this isolate.
let seedConfirmed = false;

/**
 * Creates the first project the first time the list is read — from the single
 * "Featured Project" an admin may already have saved (settings/featured-project,
 * the previous storage), otherwise from the defaults. Race-safe like the other
 * collections: the marker doc is created in the same atomic commit.
 */
async function seedIfEmpty(): Promise<void> {
  if (seedConfirmed) return;
  const marker = await getDoc(SEED_MARKER_COLLECTION, SEED_MARKER_ID);
  if (marker) {
    seedConfirmed = true;
    return;
  }
  const legacy = await getDoc(LEGACY_COLLECTION, LEGACY_ID);
  const first = legacy ? normalise(legacy.data) : DEFAULT_PROJECT;
  await commitWrites([
    { collection: SEED_MARKER_COLLECTION, id: SEED_MARKER_ID, data: { seededAt: new Date().toISOString() }, requireAbsent: true },
    { collection: COLLECTION, id: crypto.randomUUID(), data: { ...(first.name ? first : DEFAULT_PROJECT), order: 0 }, requireAbsent: true },
  ]);
}

/**
 * By default only visible projects are returned, in carousel order, with
 * uploaded photos exposed as cacheable URLs (never inline base64). Pass
 * includeHidden for the admin panel: it sees everything, with the raw data URL
 * so the edit form round-trips an unchanged photo untouched.
 */
export async function getFeaturedProjects(opts?: { includeHidden?: boolean }): Promise<FeaturedProject[]> {
  await seedIfEmpty();
  const docs = await listCollection(COLLECTION, { orderBy: "order" });
  const all: FeaturedProject[] = docs.map((d) => ({
    ...normalise(d.data),
    id: d.id,
    order: typeof d.data.order === "number" ? d.data.order : 0,
  }));
  if (opts?.includeHidden) return all;
  return all
    .filter((p) => p.visible && p.name)
    .map((p) => ({ ...p, image: publicImageSrc("featured", p.id, p.image) }));
}

export async function addFeaturedProject(input: FeaturedProjectInput): Promise<string> {
  const existing = await listCollection(COLLECTION, { orderBy: "order" });
  if (existing.length >= MAX_PROJECTS) throw new Error(`You can feature up to ${MAX_PROJECTS} projects.`);
  const last = existing.reduce((m, d) => Math.max(m, typeof d.data.order === "number" ? d.data.order : 0), -1);
  return addDoc(COLLECTION, { ...input, order: last + 1 });
}

export async function updateFeaturedProject(id: string, input: Partial<FeaturedProjectInput>): Promise<void> {
  await setDocMerge(COLLECTION, id, { ...input, updatedAt: new Date().toISOString() });
}

export async function deleteFeaturedProject(id: string): Promise<void> {
  await deleteDoc(COLLECTION, id);
}

/** Swaps this project's `order` with its neighbour above/below (no-op at the ends). Only the `order` field is written. */
export async function moveFeaturedProject(id: string, direction: "up" | "down"): Promise<void> {
  const docs = await listCollection(COLLECTION, { orderBy: "order" });
  const idx = docs.findIndex((d) => d.id === id);
  const swapIdx = direction === "up" ? idx - 1 : idx + 1;
  if (idx === -1 || swapIdx < 0 || swapIdx >= docs.length) return;
  const a = docs[idx];
  const b = docs[swapIdx];
  const orderA = typeof a.data.order === "number" ? a.data.order : idx;
  const orderB = typeof b.data.order === "number" ? b.data.order : swapIdx;
  await commitWrites([
    { collection: COLLECTION, id: a.id, data: { order: orderB }, mergeFields: ["order"] },
    { collection: COLLECTION, id: b.id, data: { order: orderA }, mergeFields: ["order"] },
  ]);
}
