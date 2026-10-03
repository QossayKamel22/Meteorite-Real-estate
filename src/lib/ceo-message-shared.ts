export const CEO_MESSAGE_MAX_WORDS = 200;

export type CeoMessage = {
  /** Paragraphs separated by a blank line. An empty string hides the section. */
  text: string;
  signerTitle: string;
  company: string;
};

export function countWords(text: string): number {
  const trimmed = text.trim();
  return trimmed ? trimmed.split(/\s+/).length : 0;
}
