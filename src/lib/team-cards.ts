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
export type Qualification = { title: string; org: string; period: string; kind: "degree" | "diploma" | "scholarship" };
/** For people without a licence certificate: an About text, short badges and qualification tiles, in the same layout as everyone else's. */
export type ProfileSheet = { about: string[]; credentials: string[]; qualifications: Qualification[] };

const KNOWN: { match: RegExp; brokerCard?: string; qualifications?: string; profile?: ProfileSheet }[] = [
  { match: /saad.*soboh/i, brokerCard: "46946", qualifications: "Professional Real Estate Diploma · CPM / CTB / CTV" },
  { match: /(maher|meher).*zamily/i, brokerCard: "64458" },
  { match: /alsuwaidi|al suwaidi/i, brokerCard: "97179" },
  {
    match: /qossay.*kamel/i,
    profile: {
      about: [
        "Software engineer who builds Meteorite's website, tools and digital marketing, drawing on mobile, web and AI engineering.",
        "Previously a Flutter developer on mobile banking apps used by real customers on iOS and Android at PCNC IT Solutions, then a customer relations officer in digital banking at Arab Bank, working across both the engineering and the customer side of digital products.",
      ],
      credentials: ["BSc Software Engineering", "Flutter · React · Python · Firebase", "AI agents (LangGraph)", "Arabic (native) · English (fluent)"],
      qualifications: [
        { title: "BSc in Software Engineering", org: "Bethlehem University", period: "2020 — 2024", kind: "degree" },
        { title: "High School Diploma, IT Stream", org: "Bethlehem High School for Boys", period: "2018 — 2020", kind: "diploma" },
        { title: "Access English Language Scholarship", org: "American Councils, U.S. Consulate", period: "2016 — 2018", kind: "scholarship" },
      ],
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
