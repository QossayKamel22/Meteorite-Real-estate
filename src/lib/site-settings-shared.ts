// Pure helpers (no server-only imports): the editable FAQ and viewing slots, shared by the admin, the API and the tests.
export type Faq = { q: string; a: string };

/** General, widely-known points for people thinking of buying or renting in Dubai; the admin can edit all of them. */
const SALE_FAQ: Faq[] = [
  { q: "Can foreigners buy property in Dubai?", a: "Yes. Non-residents and residents can buy freehold property in the areas the government has designated for foreign ownership. Our team will tell you whether a particular community qualifies." },
  { q: "What costs come on top of the price?", a: "Mainly the Dubai Land Department transfer fee (4% of the property value), the registration and administration fees, and the broker's commission. If you use a mortgage there are also valuation and bank fees. Ask us for a full breakdown on any property." },
  { q: "Can I buy off-plan, and is it safe?", a: "Yes. Off-plan purchases are usually paid in instalments against a payment plan, and developers must hold buyers' payments in a regulated escrow account. We only present projects from registered developers." },
  { q: "Do I need a mortgage pre-approval?", a: "Not required, but it helps. A pre-approval tells you your real budget and speeds up the purchase once you have chosen. We can introduce you to banks and mortgage advisers." },
  { q: "How long does a purchase take?", a: "It depends on the property and whether it is financed. Cash purchases of ready properties can move quickly; mortgages and off-plan registrations take longer. We will give you a realistic timeline for your case." },
];

const RENT_FAQ: Faq[] = [
  { q: "What do I need to rent a property?", a: "Usually a copy of your passport and Emirates ID (or visa), and a security deposit. The landlord or agent will confirm exactly what is needed for the property you choose." },
  { q: "What is Ejari?", a: "Ejari is Dubai's system for registering tenancy contracts. A registered contract is needed for many services, such as connecting utilities. We help with the registration." },
  { q: "How is rent usually paid?", a: "Rent in Dubai is commonly paid yearly, often arranged as one payment or several post-dated cheques. Some landlords offer monthly payment; each listing shows its terms." },
  { q: "Can I negotiate the rent?", a: "Often yes, depending on the property, the season and the length of the contract. Tell us your budget and we will say what is realistic." },
  { q: "Who pays the agency fee?", a: "This depends on the arrangement for each property. We state it clearly before you commit, so there are no surprises." },
];

const CONTACT_FAQ: Faq[] = [
  { q: "How quickly will you reply?", a: "We aim to reply the same working day. For something urgent, WhatsApp or a call is the fastest way to reach us." },
  { q: "Can you help me list my property?", a: "Yes. Choose \"List my property\" in the form or call us, and an agent will arrange a visit to value and photograph it." },
  { q: "Do you manage rented properties?", a: "Yes, property management is part of our service. Tell us what you need and we will explain how it works." },
  { q: "Are you a licensed brokerage?", a: "Yes. Meteorite Real Estate is registered with the Dubai Land Department and RERA; our registration details are on the About Us page." },
];


export type FaqSet = { sale: Faq[]; rent: Faq[]; contact: Faq[] };
export type ViewingSettings = { times: string[]; days: number; closedWeekdays: number[] };

export const FAQ_LIMITS = { items: 12, q: 160, a: 700 } as const;
export const DEFAULT_FAQ: FaqSet = { sale: SALE_FAQ, rent: RENT_FAQ, contact: CONTACT_FAQ };
export const DEFAULT_VIEWING: ViewingSettings = { times: ["10:00", "12:00", "14:00", "16:00", "18:00"], days: 10, closedWeekdays: [] };
export const ALL_TIMES = Array.from({ length: 13 }, (_, i) => `${String(i + 8).padStart(2, "0")}:00`); // 08:00 .. 20:00

function parseList(raw: unknown): Faq[] | string {
  if (!Array.isArray(raw)) return "Each list must be an array.";
  if (raw.length > FAQ_LIMITS.items) return `Up to ${FAQ_LIMITS.items} questions per list.`;
  const out: Faq[] = [];
  for (const r of raw) {
    const q = typeof (r as Faq)?.q === "string" ? (r as Faq).q.replace(/\s+/g, " ").trim() : "";
    const a = typeof (r as Faq)?.a === "string" ? (r as Faq).a.replace(/[ \t]+/g, " ").trim() : "";
    if (!q && !a) continue; // blank rows are dropped
    if (!q || !a) return "Every question needs both a question and an answer.";
    if (q.length > FAQ_LIMITS.q) return `A question must be ${FAQ_LIMITS.q} characters or fewer.`;
    if (a.length > FAQ_LIMITS.a) return `An answer must be ${FAQ_LIMITS.a} characters or fewer.`;
    out.push({ q, a });
  }
  return out;
}

export function parseFaqSet(input: unknown): { ok: true; value: FaqSet } | { ok: false; error: string } {
  const b = (input ?? {}) as Record<string, unknown>;
  const value = {} as FaqSet;
  for (const k of ["sale", "rent", "contact"] as const) {
    const r = parseList(b[k]);
    if (typeof r === "string") return { ok: false, error: r };
    value[k] = r;
  }
  return { ok: true, value };
}

export function parseViewing(input: unknown): { ok: true; value: ViewingSettings } | { ok: false; error: string } {
  const b = (input ?? {}) as Record<string, unknown>;
  const times = Array.isArray(b.times) ? [...new Set(b.times.filter((t): t is string => typeof t === "string" && ALL_TIMES.includes(t)))].sort() : [];
  if (times.length === 0) return { ok: false, error: "Pick at least one time." };
  const days = Number(b.days);
  if (!Number.isInteger(days) || days < 3 || days > 21) return { ok: false, error: "Days ahead must be between 3 and 21." };
  const closed = Array.isArray(b.closedWeekdays) ? [...new Set(b.closedWeekdays.filter((d): d is number => Number.isInteger(d) && d >= 0 && d <= 6))] : [];
  if (closed.length >= 7) return { ok: false, error: "You can't close every day." };
  return { ok: true, value: { times, days, closedWeekdays: closed } };
}
