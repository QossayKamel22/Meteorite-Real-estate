import "server-only";
import { getDoc, setDocMerge } from "@/lib/firestore-rest";
import type { ProjectFilm } from "@/lib/project-film-shared";

const COLLECTION = "settings";
const DOC_ID = "project-film";

/**
 * Defaults come from the developer's brochure for Mercedes-Benz Places |
 * Binghatti City (12 towers; the Grand Promenade park with 12 lifestyle
 * experiences; Nad Al Sheba beside Meydan; "the world's first Mercedes-Benz
 * branded city"). Editable in Admin > Homepage > Project film.
 */
export const DEFAULT_FILM: ProjectFilm = {
  visible: true,
  kicker: "Project Film",
  title: "Mercedes-Benz Places | Binghatti City",
  location: "Nad Al Sheba, Dubai",
  description:
    "The world's first Mercedes-Benz branded city: a masterplanned community of twelve sculpted towers where global brand prestige becomes a personal, lived-in experience — set in Nad Al Sheba, at the junction of Dubai's drive and artistry, beside the Meydan Racecourse.",
  facts: [
    { value: "12", label: "Towers" },
    { value: "12", label: "Park experiences" },
    { value: "Nad Al Sheba", label: "Location" },
    { value: "Binghatti", label: "Developer" },
  ],
  videoUrl: "https://drive.google.com/file/d/1_UB02c8k3oEn1kLGZnij_PPy0GSepuSD/view?usp=sharing",
};

export async function getProjectFilm(): Promise<ProjectFilm> {
  const doc = await getDoc(COLLECTION, DOC_ID);
  if (!doc) return DEFAULT_FILM;
  const d = doc.data as Partial<ProjectFilm>;
  const facts = Array.isArray(d.facts)
    ? d.facts.filter((f): f is { value: string; label: string } => typeof f?.value === "string" && typeof f?.label === "string")
    : DEFAULT_FILM.facts;
  return {
    visible: typeof d.visible === "boolean" ? d.visible : true,
    kicker: typeof d.kicker === "string" && d.kicker ? d.kicker : DEFAULT_FILM.kicker,
    title: typeof d.title === "string" && d.title ? d.title : DEFAULT_FILM.title,
    location: typeof d.location === "string" ? d.location : DEFAULT_FILM.location,
    description: typeof d.description === "string" ? d.description : DEFAULT_FILM.description,
    facts,
    videoUrl: typeof d.videoUrl === "string" && d.videoUrl ? d.videoUrl : DEFAULT_FILM.videoUrl,
  };
}

export async function updateProjectFilm(film: ProjectFilm): Promise<void> {
  await setDocMerge(COLLECTION, DOC_ID, film);
}
