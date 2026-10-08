export type GoogleReviewsSummary = {
  /** Link to the Google Maps listing / reviews. */
  url: string;
  /** Average star rating shown on Google (1–5). */
  rating: number;
  /** Total number of Google reviews. `null` = count the visible Google reviews added in the Testimonials panel. */
  count: number | null;
};

export function isGoogleUrl(value: string): boolean {
  try {
    const u = new URL(value);
    if (u.protocol !== "https:") return false;
    return /(^|\.)(google\.com|goo\.gl|g\.page)$/i.test(u.hostname);
  } catch {
    return false;
  }
}
