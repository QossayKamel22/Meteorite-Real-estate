import "server-only";
import { getDoc, setDocMerge } from "@/lib/firestore-rest";
import { DEFAULT_FILMS } from "@/lib/project-film-defaults";
import { parseProjectFilm, type ProjectFilm, type ProjectFilmsConfig } from "@/lib/project-film-shared";

export { DEFAULT_FILMS };

const COLLECTION = "settings";
const DOC_ID = "project-films";

export const DEFAULT_HEADING = "Featured Developments";
export const DEFAULT_INTRO =
  "Step inside the developments we are showing right now — watch the film, explore the renders and offer sheets, then speak to us.";

/** The stored configuration if an admin saved one, otherwise the defaults. Corrupt entries are dropped. */
export async function getProjectFilms(): Promise<ProjectFilmsConfig> {
  const doc = await getDoc(COLLECTION, DOC_ID);
  const data = doc?.data as { films?: unknown; heading?: unknown; intro?: unknown } | undefined;
  if (!data || !Array.isArray(data.films)) return { heading: DEFAULT_HEADING, intro: DEFAULT_INTRO, films: DEFAULT_FILMS };
  const films: ProjectFilm[] = [];
  for (const item of data.films) {
    const r = parseProjectFilm(item);
    if (r.ok) films.push(r.value);
  }
  return {
    heading: typeof data.heading === "string" ? data.heading : DEFAULT_HEADING,
    intro: typeof data.intro === "string" ? data.intro : DEFAULT_INTRO,
    films,
  };
}

export async function saveProjectFilms(config: ProjectFilmsConfig): Promise<void> {
  await setDocMerge(COLLECTION, DOC_ID, { ...config, updatedAt: new Date().toISOString() });
}
