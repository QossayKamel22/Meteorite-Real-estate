import "server-only";
import { getDoc, setDocMerge } from "@/lib/firestore-rest";
import type { FeaturedProject, FeaturedProjectInput } from "@/lib/featured-project-shared";

const COLLECTION = "settings";
const DOC_ID = "featured-project";

/**
 * Shown until an admin edits it. Every fact here is taken from the project's
 * own website (forumresidences.com): name, location, developer, home count,
 * unit types and listed amenities. No photo is bundled — the developer's
 * artwork isn't ours to republish — so the section renders a typographic panel
 * until an image is uploaded in the admin.
 */
export const DEFAULT_FEATURED_PROJECT: FeaturedProject = {
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
  imageVersion: 0,
};

export async function getFeaturedProject(): Promise<FeaturedProject> {
  const doc = await getDoc(COLLECTION, DOC_ID);
  if (!doc) return DEFAULT_FEATURED_PROJECT;
  const d = doc.data as Partial<FeaturedProject>;
  const facts = Array.isArray(d.facts)
    ? d.facts.filter((f): f is { value: string; label: string } => typeof f?.value === "string" && typeof f?.label === "string")
    : DEFAULT_FEATURED_PROJECT.facts;
  return {
    visible: typeof d.visible === "boolean" ? d.visible : DEFAULT_FEATURED_PROJECT.visible,
    kicker: typeof d.kicker === "string" && d.kicker ? d.kicker : DEFAULT_FEATURED_PROJECT.kicker,
    name: typeof d.name === "string" && d.name ? d.name : DEFAULT_FEATURED_PROJECT.name,
    location: typeof d.location === "string" ? d.location : DEFAULT_FEATURED_PROJECT.location,
    description: typeof d.description === "string" ? d.description : DEFAULT_FEATURED_PROJECT.description,
    facts,
    linkUrl: typeof d.linkUrl === "string" && d.linkUrl ? d.linkUrl : DEFAULT_FEATURED_PROJECT.linkUrl,
    linkLabel: typeof d.linkLabel === "string" && d.linkLabel ? d.linkLabel : DEFAULT_FEATURED_PROJECT.linkLabel,
    image: typeof d.image === "string" ? d.image : "",
    imageVersion: typeof d.imageVersion === "number" ? d.imageVersion : 0,
  };
}

export async function updateFeaturedProject(input: FeaturedProjectInput): Promise<void> {
  const current = await getFeaturedProject();
  // Bump the version only when the image actually changed, so a text-only edit
  // doesn't make every visitor re-download an unchanged photo.
  const imageVersion = input.image === current.image ? current.imageVersion : Date.now();
  await setDocMerge(COLLECTION, DOC_ID, { ...input, imageVersion });
}
