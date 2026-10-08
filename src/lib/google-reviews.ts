import "server-only";
import { getDoc, setDocMerge } from "@/lib/firestore-rest";
import type { GoogleReviewsSummary } from "@/lib/google-reviews-shared";

const COLLECTION = "settings";
const DOC_ID = "google-reviews";

/**
 * The company's Google Maps listing. The rating (5.0) is what Google shows for
 * it; Google doesn't expose the review count to signed-out visitors for this
 * listing, so the count starts empty and falls back to the number of visible
 * Google reviews added in the Testimonials panel until an admin enters it.
 */
const DEFAULTS: GoogleReviewsSummary = {
  url: "https://www.google.com/maps/place/Meteorite+Real+Estate+L.L.C/@25.2411062,55.2721395,17z/data=!4m8!3m7!1s0x3e5f43e9dcb90589:0xcd00ffa49ce34140!8m2!3d25.2411062!4d55.2721395!9m1!1b1!16s%2Fg%2F11rf4gtm4h",
  rating: 5,
  count: null,
};

export async function getGoogleReviews(): Promise<GoogleReviewsSummary> {
  const doc = await getDoc(COLLECTION, DOC_ID);
  if (!doc) return DEFAULTS;
  const d = doc.data as Partial<GoogleReviewsSummary>;
  return {
    url: typeof d.url === "string" && d.url ? d.url : DEFAULTS.url,
    rating: typeof d.rating === "number" ? d.rating : DEFAULTS.rating,
    count: typeof d.count === "number" ? d.count : null,
  };
}

export async function updateGoogleReviews(next: GoogleReviewsSummary): Promise<void> {
  await setDocMerge(COLLECTION, DOC_ID, next);
}
