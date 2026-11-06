import "server-only";
import { addDoc, deleteDoc, listCollection, setDocMerge } from "@/lib/firestore-rest";
import type { ContactMessage } from "@/lib/messages-shared";

const COLLECTION = "messages";

function toMessage(id: string, d: Record<string, unknown>): ContactMessage {
  return {
    id,
    name: String(d.name ?? ""),
    email: String(d.email ?? ""),
    phone: String(d.phone ?? ""),
    topic: String(d.topic ?? ""),
    message: String(d.message ?? ""),
    source: String(d.source ?? ""),
    read: d.read === true,
    createdAt: String(d.createdAt ?? new Date(0).toISOString()),
  };
}

export async function addMessage(m: Omit<ContactMessage, "id" | "read" | "createdAt">): Promise<string> {
  return addDoc(COLLECTION, { ...m, read: false, createdAt: new Date().toISOString() });
}

/** Newest first. The inbox is capped so it can never grow into a heavy page. */
export async function getMessages(limit = 200): Promise<ContactMessage[]> {
  const docs = await listCollection(COLLECTION, { orderBy: "createdAt", direction: "DESCENDING", limit });
  return docs.map((d) => toMessage(d.id, d.data));
}

export async function setMessageRead(id: string, read: boolean): Promise<void> {
  await setDocMerge(COLLECTION, id, { read });
}

export async function deleteMessage(id: string): Promise<void> {
  await deleteDoc(COLLECTION, id);
}
