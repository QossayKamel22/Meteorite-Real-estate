import "server-only";
import { getDoc, setDocMerge } from "@/lib/firestore-rest";
import type { SocialAccounts } from "@/lib/reels-shared";

const COLLECTION = "settings";
const DOC_ID = "social-accounts";

/** The company's TikTok page (given by the team); YouTube is empty until a channel link is added in Admin > Reels. */
export const DEFAULT_ACCOUNTS: SocialAccounts = { tiktok: "https://www.tiktok.com/@meteorite.real.es", youtube: "" };

export async function getSocialAccounts(): Promise<SocialAccounts> {
  const doc = await getDoc(COLLECTION, DOC_ID);
  if (!doc) return DEFAULT_ACCOUNTS;
  const d = doc.data as Partial<SocialAccounts>;
  return { tiktok: typeof d.tiktok === "string" ? d.tiktok : DEFAULT_ACCOUNTS.tiktok, youtube: typeof d.youtube === "string" ? d.youtube : "" };
}

export async function saveSocialAccounts(a: SocialAccounts): Promise<void> {
  await setDocMerge(COLLECTION, DOC_ID, { ...a, updatedAt: new Date().toISOString() });
}
