// Pure helpers (no server-only imports): which certificate belongs to which team member, and the details on a business card.

export type CardCert = { id: string; title: string; licenseNo?: string; registrationDate?: string; expiryDate?: string; activities?: string[]; images: string[] };
export type TeamMember = {
  id: string;
  name: string;
  title: string;
  photo: string;
  email: string;
  phone?: string;
  bio?: string;
  background?: string;
  credentials?: string[];
  brokerCard?: string;
  qualifications?: string;
  profileUrl?: string;
};

/** Details that were printed on the team's own cards before they could be edited in the admin. */
export type ProfileSheet = { summary: string; highlights: string[]; skills: string[]; source: string };

const KNOWN: { match: RegExp; brokerCard?: string; qualifications?: string; profile?: ProfileSheet }[] = [
  { match: /saad.*soboh/i, brokerCard: "46946", qualifications: "Professional Real Estate Diploma · CPM / CTB / CTV" },
  { match: /(maher|meher).*zamily/i, brokerCard: "64458" },
  { match: /alsuwaidi|al suwaidi/i, brokerCard: "97179" },
  {
    match: /qossay.*kamel/i,
    profile: {
      summary: "Software engineer who builds Meteorite's website, tools and digital marketing.",
      highlights: [
        "Shipped Flutter mobile banking apps used by real customers on iOS and Android, at PCNC IT Solutions (Bank of Palestine, Cairo Amman Bank, Arab Islamic Bank, Safa Bank, Egyptian Arab Land Bank).",
        "Background in digital banking and customer-facing banking technology at Arab Bank: digital sales, customer relations and internet banking.",
        "Full-stack web development (React, TypeScript, Firebase) and AI agent engineering (Python, FastAPI, LangGraph).",
      ],
      skills: ["Flutter", "React / Next.js", "TypeScript", "Firebase", "Python / FastAPI", "AI agents (LangGraph)", "UI / UX (Figma)"],
      source: "From his public portfolio on GitHub",
    },
  },
];

/** A short professional sheet for people who have no licence certificate (taken from public sources, editable by replacing it in the admin profile). */
export function profileSheetOf(m: Pick<TeamMember, "name">): ProfileSheet | undefined {
  return KNOWN.find((k) => k.match.test(m.name))?.profile;
}

export function brokerCardOf(m: Pick<TeamMember, "name" | "brokerCard" | "credentials">): string | undefined {
  if (m.brokerCard) return m.brokerCard;
  const fromCredentials = m.credentials?.map((c) => c.match(/broker card\s*#?\s*(\d{3,8})/i)?.[1]).find(Boolean);
  if (fromCredentials) return fromCredentials;
  return KNOWN.find((k) => k.match.test(m.name))?.brokerCard;
}

export function qualificationsOf(m: Pick<TeamMember, "name" | "qualifications">): string | undefined {
  return m.qualifications || KNOWN.find((k) => k.match.test(m.name))?.qualifications;
}

/** The certificates (broker card, registration) that carry this person's licence number. */
export function certsFor(m: Pick<TeamMember, "name" | "brokerCard" | "credentials">, certs: CardCert[]): CardCert[] {
  const n = brokerCardOf(m);
  return n ? certs.filter((c) => c.licenseNo === n) : [];
}
