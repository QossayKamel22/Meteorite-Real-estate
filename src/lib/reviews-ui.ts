// Presentation helpers for review authors. Pure functions (no server-only
// imports) so both the server-rendered cards and the client hero carousel use
// the exact same rules — every current and future reviewer gets an avatar
// automatically, with nothing to configure.

/**
 * First letter of the first name + first letter of the last name
 * ("Nitesh Sekhsaria" → "NS", "Mary Jane Watson" → "MW", "s Keshav" → "SK").
 * A single name gives a single letter ("Saif" → "S"). Handles extra spaces,
 * punctuation ("Auchuta N." → "AN") and non-Latin names.
 */
export function getInitials(name: string): string {
  const words = name
    .trim()
    .split(/\s+/)
    .map((w) => Array.from(w.replace(/^[^\p{L}\p{N}]+/u, ""))[0] ?? "")
    .filter(Boolean);
  if (words.length === 0) return "?";
  const first = words[0];
  const last = words.length > 1 ? words[words.length - 1] : "";
  return (first + last).toLocaleUpperCase();
}

// Soft, desaturated pairs (top → bottom) in the spirit of Apple's contact
// monograms. Muted enough to sit on the navy hero and on the light cards.
const AVATAR_TONES: readonly [string, string][] = [
  ["#8E9BB5", "#667392"], // slate blue
  ["#B39A7E", "#8D7658"], // warm sand
  ["#7FA396", "#5A7F72"], // sage
  ["#A58BAE", "#7F6789"], // dusty mauve
  ["#7DA0C0", "#5A7FA0"], // sky
  ["#C08E83", "#9C6B61"], // terracotta
  ["#9AA3AE", "#737C88"], // graphite
];

/** Stable gradient for a name: the same person always gets the same colour. */
export function getAvatarGradient(name: string): string {
  let hash = 0;
  for (const ch of name.trim().toLowerCase()) hash = (hash * 31 + ch.charCodeAt(0)) >>> 0;
  const [top, bottom] = AVATAR_TONES[hash % AVATAR_TONES.length];
  return `linear-gradient(180deg, ${top} 0%, ${bottom} 100%)`;
}
