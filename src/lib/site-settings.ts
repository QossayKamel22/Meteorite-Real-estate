import "server-only";
import { getDoc, setDocMerge } from "@/lib/firestore-rest";
import { DEFAULT_FAQ, DEFAULT_VIEWING, parseFaqSet, parseViewing, type FaqSet, type ViewingSettings } from "@/lib/site-settings-shared";

const COLLECTION = "settings";

/** The FAQ lists; whatever has not been edited in the admin falls back to the defaults. */
export async function getFaqs(): Promise<FaqSet> {
  const doc = await getDoc(COLLECTION, "faq");
  if (!doc) return DEFAULT_FAQ;
  const parsed = parseFaqSet(doc.data);
  return parsed.ok ? parsed.value : DEFAULT_FAQ;
}
export async function saveFaqs(v: FaqSet): Promise<void> {
  await setDocMerge(COLLECTION, "faq", { ...v, updatedAt: new Date().toISOString() });
}

export async function getViewingSettings(): Promise<ViewingSettings> {
  const doc = await getDoc(COLLECTION, "viewing");
  if (!doc) return DEFAULT_VIEWING;
  const parsed = parseViewing(doc.data);
  return parsed.ok ? parsed.value : DEFAULT_VIEWING;
}
export async function saveViewingSettings(v: ViewingSettings): Promise<void> {
  await setDocMerge(COLLECTION, "viewing", { ...v, updatedAt: new Date().toISOString() });
}
