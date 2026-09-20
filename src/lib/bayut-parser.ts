/**
 * Best-effort extraction of property fields from text copied straight out of
 * a Bayut listing page in the admin's own browser.
 *
 * Bayut blocks server-side fetches (bot-protection JS challenge — confirmed
 * against both listing and company pages, even with realistic browser
 * headers), so there's no reliable way to fetch a listing automatically from
 * our server. This parses whatever text the admin pastes instead — it's a
 * prefill to review and correct, not an authoritative import.
 */
export type BayutParseResult = {
  title?: string;
  location?: string;
  price?: number;
  rentFrequency?: "yearly" | "monthly";
  bedrooms?: number;
  isStudio?: boolean;
  bathrooms?: number;
  sizeSqft?: number;
  sourceUrl?: string;
};

export function parseBayutText(raw: string): BayutParseResult {
  const result: BayutParseResult = {};
  const text = raw.replace(/\r\n/g, "\n");
  const lines = text
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  // Price: "AED 4,250,000"
  const priceMatch = text.match(/AED\s*([\d,]+)/i);
  if (priceMatch) {
    const price = Number(priceMatch[1].replace(/,/g, ""));
    if (Number.isFinite(price) && price > 0) result.price = price;
  }

  // Rent frequency, only meaningful alongside a price
  if (/\byearly\b|\/\s*year\b/i.test(text)) result.rentFrequency = "yearly";
  else if (/\bmonthly\b|\/\s*month\b/i.test(text)) result.rentFrequency = "monthly";

  // Bedrooms: "4 Beds", "1 Bed", or "Studio"
  const studioMatch = /\bstudio\b/i.test(text);
  if (studioMatch) {
    result.isStudio = true;
    result.bedrooms = 0;
  } else {
    const bedMatch = text.match(/(\d+)\s*Beds?\b/i);
    if (bedMatch) result.bedrooms = Number(bedMatch[1]);
  }

  // Bathrooms: "5 Baths"
  const bathMatch = text.match(/(\d+)\s*Baths?\b/i);
  if (bathMatch) result.bathrooms = Number(bathMatch[1]);

  // Size: "2,426 sqft"
  const sizeMatch = text.match(/([\d,]+)\s*sq\s*\.?\s*ft\b/i);
  if (sizeMatch) {
    const size = Number(sizeMatch[1].replace(/,/g, ""));
    if (Number.isFinite(size) && size > 0) result.sizeSqft = size;
  }

  // Source URL, if the admin pasted the address bar contents along with the text
  const urlMatch = text.match(/https?:\/\/(?:www\.)?bayut\.com\/property\/[^\s"'<>]+/i);
  if (urlMatch) result.sourceUrl = urlMatch[0];

  // Location: Bayut addresses consistently end in ", Dubai" — take the
  // shortest such line so we get an address, not a whole paragraph.
  const locationCandidates = lines
    .map((l) => l.match(/^[^,]+(?:,[^,]+){0,4},\s*Dubai\.?$/i)?.[0])
    .filter((l): l is string => Boolean(l))
    .sort((a, b) => a.length - b.length);
  if (locationCandidates.length > 0) {
    result.location = locationCandidates[0].replace(/\.$/, "");
  }

  // Title: the longest of the first ~15 non-empty lines that isn't the price/
  // location line and doesn't look like site chrome (nav links, breadcrumbs).
  const skipPatterns = /^(AED|Beds?|Baths?|sqft|Dubai|Bayut|Home|Search|Menu|Sign in|Login)\b/i;
  const titleCandidates = lines
    .slice(0, 15)
    .filter((l) => l.length > 15 && l.length < 160 && !skipPatterns.test(l) && l !== result.location)
    .sort((a, b) => b.length - a.length);
  if (titleCandidates.length > 0) {
    result.title = titleCandidates[0];
  }

  return result;
}
