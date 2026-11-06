// Pure helpers (no server-only imports) shared by the contact API, the admin and the unit tests.

export const TOPICS = ["Buy", "Rent", "Sell", "List my property", "Book a viewing", "Something else"] as const;
export const MESSAGE_LIMITS = { name: 80, email: 120, phone: 30, message: 1500, topic: 30 } as const;

export type ContactMessage = {
  id: string;
  name: string;
  email: string;
  phone: string;
  topic: string;
  message: string;
  /** The page the visitor wrote from (for example a property). */
  source: string;
  /** A requested viewing, "YYYY-MM-DD HH:MM" (Dubai time), or empty. */
  viewing: string;
  read: boolean;
  createdAt: string;
};

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const clean = (v: unknown, max: number) => (typeof v === "string" ? v.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "").trim().slice(0, max) : "");

export function parseContactInput(input: unknown): { ok: true; value: Omit<ContactMessage, "id" | "read" | "createdAt"> } | { ok: false; error: string; spam?: boolean } {
  const b = (input && typeof input === "object" ? input : {}) as Record<string, unknown>;
  // A hidden field real visitors never see: if it is filled in, it is a bot.
  if (typeof b.website === "string" && b.website.trim() !== "") return { ok: false, error: "Rejected.", spam: true };
  const name = clean(b.name, MESSAGE_LIMITS.name).replace(/\s+/g, " ");
  const email = clean(b.email, MESSAGE_LIMITS.email);
  const phone = clean(b.phone, MESSAGE_LIMITS.phone);
  const message = clean(b.message, MESSAGE_LIMITS.message);
  const topicRaw = clean(b.topic, MESSAGE_LIMITS.topic);
  const topic = (TOPICS as readonly string[]).includes(topicRaw) ? topicRaw : "";
  const source = clean(b.source, 120);
  const viewingRaw = clean(b.viewing, 16);
  const viewing = /^\d{4}-\d{2}-\d{2} \d{2}:00$/.test(viewingRaw) ? viewingRaw : "";
  if (!name) return { ok: false, error: "Please enter your name." };
  if (!EMAIL.test(email)) return { ok: false, error: "Please enter a valid email address." };
  if (phone && !/^[+()\d\s-]{5,30}$/.test(phone)) return { ok: false, error: "That phone number doesn't look right." };
  if (message.length < 5) return { ok: false, error: "Please write a short message." };
  if ((message.match(/https?:\/\//g) ?? []).length > 2) return { ok: false, error: "Please remove the extra links.", spam: true };
  return { ok: true, value: { name, email, phone, topic, message, source: source.startsWith("/") ? source : "", viewing } };
}
