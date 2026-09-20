import "server-only";
import { adminDb } from "@/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";

const AGENTS_COL = adminDb.collection("agents");

export type Agent = {
  id: string;
  name: string;
  title: string;
  photo: string;
  email: string;
  phone?: string;
  profileUrl?: string;
  order: number;
  /** Defaults to true when absent (existing docs predate this field). */
  visible?: boolean;
  /** Rich editorial fields, populated for the CEO/founder only. */
  bio?: string;
  background?: string;
  credentials?: string[];
};

export type AgentInput = Omit<Agent, "id" | "order">;

/**
 * Seed data — the real roster as verified from meteoriterealestate.com
 * (plus Qossay Kamel, added directly by request). Used only to populate
 * Firestore the first time the collection is empty.
 */
const SEED_AGENTS: AgentInput[] = [
  {
    name: "Saad Abdullah Soboh",
    title: "CEO and Founder",
    photo: "/brand/saad-abdullah-soboh.jpg",
    email: "s.soboh@meteoriterealestate.com",
    phone: "+971 50 110 2242",
    profileUrl: "https://meteoriterealestate.com/agents/saad-abdullah-soboh/",
    bio: "Welcome to our boutique real estate firm, where our CEO and Founder personally oversee every aspect of our services. With a customer-focused approach, we take pride in delivering exceptional property management services for leasing and selling tailored solutions to your unique needs.",
    background:
      "Over 17 years in banking — mortgage, valuations, escrow law, business development, credit administration, and comprehensive business banking services — brought to Meteorite's real estate brokerage, leasing, sales, valuation and negotiation practice.",
    credentials: [
      "Broker Card #46946",
      "RERA ORN 25323",
      "72 credit hours of real estate training across 9 courses",
    ],
  },
  {
    name: "Mohd Amin Mohammad Hattab",
    title: "Agent",
    photo: "/brand/agent-mohd-amin-hattab.png",
    email: "Mohd.Hattab@meteoriterealestate.com",
    phone: "+971 52 699 7631",
    profileUrl: "https://meteoriterealestate.com/agents/mohd-amin-mohammad-hattab/",
  },
  {
    name: "Meher Samir M Zamily",
    title: "Agent",
    photo: "/brand/agent-meher-samir.png",
    email: "info@meteoriterealestate.com",
    phone: "+971 50 659 9176",
    profileUrl: "https://meteoriterealestate.com/agents/meher-samir/",
  },
  {
    name: "Qossay Kamel",
    title: "IT & Marketing Manager",
    photo: "/brand/agent-qossay-kamel.jpg",
    email: "kamelqossay@gmail.com",
  },
];

const SEED_MARKER = adminDb.collection("_meta").doc("agentsSeeded");

/**
 * Seeds once, guarded by a transaction on a sentinel doc so concurrent
 * calls (e.g. multiple pages building in parallel) can't both pass the
 * "is it empty" check and double-insert the seed data.
 */
async function seedIfEmpty(): Promise<void> {
  await adminDb.runTransaction(async (tx) => {
    const marker = await tx.get(SEED_MARKER);
    if (marker.exists) return;
    tx.set(SEED_MARKER, { seededAt: FieldValue.serverTimestamp() });
    SEED_AGENTS.forEach((agent, i) => {
      tx.set(AGENTS_COL.doc(), { ...agent, order: i });
    });
  });
}

/** Fields that make up the public Agent shape — excludes internal bookkeeping
 *  fields like `updatedAt` (a Firestore Timestamp instance), which can't
 *  cross the Server->Client Component boundary as a class instance. */
const AGENT_FIELDS = [
  "name",
  "title",
  "photo",
  "email",
  "phone",
  "profileUrl",
  "order",
  "visible",
  "bio",
  "background",
  "credentials",
] as const;

function toPlainAgent(id: string, data: FirebaseFirestore.DocumentData): Agent {
  const agent = { id } as Record<string, unknown>;
  for (const key of AGENT_FIELDS) {
    if (data[key] !== undefined) agent[key] = data[key];
  }
  return agent as Agent;
}

/** By default, only agents visible on the public site are returned — pass
 *  includeHidden for the admin panel, which needs to see (and un-hide) everything. */
export async function getAgents(opts?: { includeHidden?: boolean }): Promise<Agent[]> {
  await seedIfEmpty();
  const snap = await AGENTS_COL.orderBy("order", "asc").get();
  const all = snap.docs.map((doc) => toPlainAgent(doc.id, doc.data()));
  return opts?.includeHidden ? all : all.filter((a) => a.visible !== false);
}

export async function addAgent(data: AgentInput): Promise<string> {
  const countSnap = await AGENTS_COL.get();
  const ref = await AGENTS_COL.add({ ...data, order: countSnap.size });
  return ref.id;
}

export async function updateAgent(id: string, data: Partial<AgentInput>): Promise<void> {
  await AGENTS_COL.doc(id).update({ ...data, updatedAt: FieldValue.serverTimestamp() });
}

export async function deleteAgent(id: string): Promise<void> {
  await AGENTS_COL.doc(id).delete();
}

/** Swaps this agent's `order` with its neighbor above/below (no-op at the ends). */
export async function moveAgent(id: string, direction: "up" | "down"): Promise<void> {
  const snap = await AGENTS_COL.orderBy("order", "asc").get();
  const docs = snap.docs;
  const idx = docs.findIndex((d) => d.id === id);
  const swapIdx = direction === "up" ? idx - 1 : idx + 1;
  if (idx === -1 || swapIdx < 0 || swapIdx >= docs.length) return;

  const a = docs[idx];
  const b = docs[swapIdx];
  await adminDb.runTransaction(async (tx) => {
    tx.update(a.ref, { order: b.data().order });
    tx.update(b.ref, { order: a.data().order });
  });
}
