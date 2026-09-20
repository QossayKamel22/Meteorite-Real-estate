import "server-only";
import { addDoc, commitWrites, countCollection, deleteDoc, getDoc, listCollection, setDocMerge } from "@/lib/firestore-rest";

const COLLECTION = "agents";

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

const SEED_MARKER_COLLECTION = "_meta";
const SEED_MARKER_ID = "agentsSeeded";

/**
 * Seeds once, guarded by a `requireAbsent` precondition on a sentinel doc
 * within the same atomic commit, so concurrent calls (e.g. multiple pages
 * building in parallel) can't both pass the "is it empty" check and
 * double-insert the seed data.
 */
async function seedIfEmpty(): Promise<void> {
  const marker = await getDoc(SEED_MARKER_COLLECTION, SEED_MARKER_ID);
  if (marker) return;

  await commitWrites([
    { collection: SEED_MARKER_COLLECTION, id: SEED_MARKER_ID, data: { seededAt: new Date().toISOString() }, requireAbsent: true },
    ...SEED_AGENTS.map((agent, i) => ({
      collection: COLLECTION,
      id: crypto.randomUUID(),
      data: { ...agent, order: i },
      requireAbsent: true,
    })),
  ]);
}

function toAgent(id: string, data: Record<string, unknown>): Agent {
  return {
    id,
    name: data.name as string,
    title: data.title as string,
    photo: data.photo as string,
    email: data.email as string,
    order: (data.order as number) ?? 0,
    phone: data.phone as string | undefined,
    profileUrl: data.profileUrl as string | undefined,
    visible: data.visible as boolean | undefined,
    bio: data.bio as string | undefined,
    background: data.background as string | undefined,
    credentials: data.credentials as string[] | undefined,
  };
}

/** By default, only agents visible on the public site are returned — pass
 *  includeHidden for the admin panel, which needs to see (and un-hide) everything. */
export async function getAgents(opts?: { includeHidden?: boolean }): Promise<Agent[]> {
  await seedIfEmpty();
  const docs = await listCollection(COLLECTION, { orderBy: "order" });
  const all = docs.map((d) => toAgent(d.id, d.data));
  return opts?.includeHidden ? all : all.filter((a) => a.visible !== false);
}

export async function addAgent(data: AgentInput): Promise<string> {
  const order = await countCollection(COLLECTION);
  return addDoc(COLLECTION, { ...data, order });
}

export async function updateAgent(id: string, data: Partial<AgentInput>): Promise<void> {
  await setDocMerge(COLLECTION, id, { ...data, updatedAt: new Date().toISOString() });
}

export async function deleteAgent(id: string): Promise<void> {
  await deleteDoc(COLLECTION, id);
}

/** Swaps this agent's `order` with its neighbor above/below (no-op at the ends). */
export async function moveAgent(id: string, direction: "up" | "down"): Promise<void> {
  const docs = await listCollection(COLLECTION, { orderBy: "order" });
  const idx = docs.findIndex((d) => d.id === id);
  const swapIdx = direction === "up" ? idx - 1 : idx + 1;
  if (idx === -1 || swapIdx < 0 || swapIdx >= docs.length) return;

  const a = docs[idx];
  const b = docs[swapIdx];
  await commitWrites([
    { collection: COLLECTION, id: a.id, data: { ...a.data, order: b.data.order } },
    { collection: COLLECTION, id: b.id, data: { ...b.data, order: a.data.order } },
  ]);
}
