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
export type SheetRow = { title: string; org: string; period: string };
export type ProfileSheet = { education: SheetRow[]; experience: SheetRow[]; skills: string[]; languages?: string };

const KNOWN: { match: RegExp; brokerCard?: string; qualifications?: string; profile?: ProfileSheet }[] = [
  { match: /saad.*soboh/i, brokerCard: "46946", qualifications: "Professional Real Estate Diploma · CPM / CTB / CTV" },
  { match: /(maher|meher).*zamily/i, brokerCard: "64458" },
  { match: /alsuwaidi|al suwaidi/i, brokerCard: "97179" },
  {
    match: /qossay.*kamel/i,
    profile: {
      education: [
        { title: "BSc in Software Engineering", org: "Bethlehem University", period: "2020 – 2024" },
        { title: "High School Diploma, IT Stream", org: "Bethlehem High School for Boys", period: "2018 – 2020" },
        { title: "Access English Language Scholarship", org: "American Councils, U.S. Consulate", period: "2016 – 2018" },
      ],
      experience: [
        { title: "Customer Relations Officer, Digital Banking", org: "Arab Bank", period: "2025 – 2026" },
        { title: "Flutter Developer, mobile banking apps", org: "PCNC IT Solutions", period: "2024 – 2025" },
      ],
      skills: ["Flutter", "React / Next.js", "TypeScript", "Firebase", "Python / FastAPI", "AI agents", "UI / UX"],
      languages: "Arabic (native) · English (fluent)",
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
