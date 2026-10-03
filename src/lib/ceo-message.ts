import "server-only";
import { getDoc, setDocMerge } from "@/lib/firestore-rest";
import type { CeoMessage } from "@/lib/ceo-message-shared";

const COLLECTION = "settings";
const DOC_ID = "ceo-message";

/** Original message, used until an admin edits or deletes it. */
const DEFAULTS: CeoMessage = {
  text:
    "When it comes to buying or investing in real estate, you need a trusted, educated, honest, and experienced expert real estate agent who provides fully transparent, accurate, and reliable information—so you can make the right decision with confidence before taking the final step.\n\nYour investment deserves the right advice, the right information, and the right professional.",
  signerTitle: "CEO",
  company: "METEORITE REAL ESTATE LLC",
};

export async function getCeoMessage(): Promise<CeoMessage> {
  const doc = await getDoc(COLLECTION, DOC_ID);
  if (!doc) return DEFAULTS;
  return { ...DEFAULTS, ...(doc.data as Partial<CeoMessage>) };
}

export async function updateCeoMessage(patch: Partial<CeoMessage>): Promise<void> {
  await setDocMerge(COLLECTION, DOC_ID, patch);
}
