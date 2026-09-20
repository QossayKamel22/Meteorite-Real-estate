/**
 * Best-effort extraction of property fields from content copied straight out
 * of a Bayut listing page in the admin's own browser.
 *
 * Bayut blocks server-side fetches (bot-protection JS challenge — confirmed
 * against both listing and company pages, even with realistic browser
 * headers), so there's no reliable way to fetch a listing automatically from
 * our server. This parses whatever the admin pastes instead — it's a
 * prefill to review and correct, not an authoritative import.
 *
 * Accepts either plain copied text (Cmd/Ctrl+A on the rendered page) or the
 * page's HTML source (View Page Source) — the latter also lets it pull out
 * the listing photo and use SEO meta tags (title/description), which are far
 * more reliable than guessing from line position.
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
  image?: string;
  description?: string;
  amenities?: string[];
};

const KNOWN_AMENITIES = [
  "Centrally air-conditioned",
  "Central heating",
  "Double-glazed windows",
  "Balcony",
  "Terrace",
  "Kids play area",
  "Lawn",
  "Garden",
  "Barbeque area",
  "Broadband internet",
  "Electricity backup",
  "Storage",
  "Freehold",
  "Fully furnished",
  "Built-in wardrobes",
  "Swimming pool",
  "Gym",
  "Sauna",
  "Steam room",
  "24-hour concierge",
  "24-hour security",
  "CCTV security",
  "Pets allowed",
  "Maidroom",
  "Laundry",
  "Jacuzzi",
  "Covered parking",
  "Security staff",
  "Reception services",
  "Day care center",
  "Prayer room",
  "Jogging track",
  "Basketball court",
  "Vacant and ready to move",
];

const isHtml = (input: string) => /<[a-z][\s\S]*>/i.test(input);

function decodeEntities(input: string): string {
  return input
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&quot;/g, '"')
    .trim();
}

/** Collapses an element's inner HTML down to plain text (used for single-element extracts like <h1>). */
function stripTags(input: string): string {
  return decodeEntities(input.replace(/<[^>]+>/g, " ").replace(/\s+/g, " "));
}

/** Converts tags to newlines rather than spaces, so line-based heuristics below still see element boundaries. */
function htmlToLines(input: string): string {
  return decodeEntities(
    input
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<[^>]+>/g, "\n")
  );
}

/** Pulls the most reliable title available: og:title meta, then <title>, then <h1>. */
function extractTitleFromHtml(html: string): string | undefined {
  const og = html.match(/<meta[^>]+property=["']og:title["'][^>]*content=["']([^"']+)["']/i);
  if (og) return decodeEntities(og[1]);

  const titleTag = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  if (titleTag) {
    // Bayut's <title> is typically "Listing headline | Bayut" — drop the site suffix.
    return decodeEntities(titleTag[1]).replace(/\s*[|\-–]\s*Bayut.*$/i, "").trim();
  }

  const h1 = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
  if (h1) return stripTags(h1[1]);

  return undefined;
}

function extractDescriptionFromHtml(html: string): string | undefined {
  const og = html.match(/<meta[^>]+property=["']og:description["'][^>]*content=["']([^"']+)["']/i);
  if (og) return decodeEntities(og[1]);

  const meta = html.match(/<meta[^>]+name=["']description["'][^>]*content=["']([^"']+)["']/i);
  if (meta) return decodeEntities(meta[1]);

  return undefined;
}

function extractImage(rawHtml: string): string | undefined {
  // Prefer Bayut's own CDN — this is the actual listing photo, not a logo/icon.
  const candidates = [...rawHtml.matchAll(/https?:\/\/images\.bayut\.com\/thumbnails\/[^\s"'<>)]+\.(?:jpe?g|png|webp)/gi)].map(
    (m) => m[0]
  );
  if (candidates.length > 0) {
    // Bayut thumbnail URLs encode resolution as e.g. "-800x600" — prefer the largest available.
    return candidates.sort((a, b) => {
      const resA = Number(a.match(/-(\d+)x\d+\./)?.[1] ?? 0);
      const resB = Number(b.match(/-(\d+)x\d+\./)?.[1] ?? 0);
      return resB - resA;
    })[0];
  }
  return undefined;
}

export function parseBayutText(raw: string): BayutParseResult {
  const result: BayutParseResult = {};
  const html = isHtml(raw);

  const image = extractImage(raw);
  if (image) result.image = image;

  if (html) {
    const title = extractTitleFromHtml(raw);
    if (title) result.title = title;
    const description = extractDescriptionFromHtml(raw);
    if (description) result.description = description;
  }

  const text = (html ? htmlToLines(raw) : raw).replace(/\r\n/g, "\n");
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

  // Source URL, if the admin pasted the address bar contents (or it's in the HTML) along with the text
  const urlMatch = raw.match(/https?:\/\/(?:www\.)?bayut\.com\/property\/[^\s"'<>]+/i);
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

  // Fallback title/description from plain-text line heuristics, only used
  // when the HTML meta tags above didn't already give us something (plain
  // pasted page text has no <title>/<h1> to lean on).
  const skipPatterns = /^(AED|Beds?|Baths?|sqft|Dubai|Bayut|Home|Search|Menu|Sign in|Login)\b/i;
  const isProseLine = (l: string) => l.length > 80 && /[.!]\s/.test(l);

  if (!result.title) {
    const titleCandidates = lines
      .slice(0, 15)
      .filter(
        (l) => l.length > 15 && l.length < 160 && !skipPatterns.test(l) && !isProseLine(l) && l !== result.location
      );
    if (titleCandidates.length > 0) result.title = titleCandidates[0];
  }

  if (!result.description) {
    const descriptionCandidates = lines.filter(
      (l) => isProseLine(l) && l.length < 2000 && !skipPatterns.test(l) && l !== result.title && l !== result.location
    );
    if (descriptionCandidates.length > 0) {
      result.description = descriptionCandidates.sort((a, b) => b.length - a.length)[0];
    }
  }

  // Amenities: check which of the standard Bayut amenity phrases are mentioned.
  const amenities = KNOWN_AMENITIES.filter((a) => new RegExp(`\\b${a.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i").test(text));
  if (amenities.length > 0) result.amenities = amenities;

  return result;
}
