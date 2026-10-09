import "server-only";
import { cache } from "react";
import {
  FIRESTORE_HOST,
  GOOGLE_REQUEST_TIMEOUT_MS,
  basePath,
  getAccessToken,
  invalidateAccessToken,
} from "@/lib/firestore-auth";
import { resilientFetch } from "@/lib/resilient-fetch";

/**
 * Minimal Firestore REST client using the same service-account credentials
 * as before, but authenticated via a hand-signed JWT (Web Crypto) exchanged
 * for a Google OAuth2 access token — no native TCP/gRPC, so this runs in
 * Cloudflare Workers. This replaces the firebase-admin Node SDK, which
 * cannot run there (it requires gRPC over raw sockets).
 *
 * Covers exactly what this app's data modules need: get/list/create/update/
 * delete on documents, plus atomic multi-write commits (used for seeding
 * with an existence precondition, and for swapping two docs' `order`).
 */

function fsFetch(url: string, init?: RequestInit): Promise<Response> {
  return resilientFetch(url, init, {
    getToken: getAccessToken,
    invalidateToken: invalidateAccessToken,
    timeoutMs: GOOGLE_REQUEST_TIMEOUT_MS,
  });
}

// --- Firestore's typed-value wire format <-> plain JS -----------------

type FsValue =
  | { stringValue: string }
  | { integerValue: string }
  | { doubleValue: number }
  | { booleanValue: boolean }
  | { nullValue: null }
  | { timestampValue: string }
  | { arrayValue: { values?: FsValue[] } }
  | { mapValue: { fields?: Record<string, FsValue> } };

function toFsValue(value: unknown): FsValue {
  if (value === null || value === undefined) return { nullValue: null };
  if (typeof value === "string") return { stringValue: value };
  if (typeof value === "boolean") return { booleanValue: value };
  if (typeof value === "number") {
    return Number.isInteger(value) ? { integerValue: String(value) } : { doubleValue: value };
  }
  if (value instanceof Date) return { timestampValue: value.toISOString() };
  if (Array.isArray(value)) return { arrayValue: { values: value.map(toFsValue) } };
  if (typeof value === "object") {
    return { mapValue: { fields: toFsFields(value as Record<string, unknown>) } };
  }
  throw new Error(`Unsupported Firestore value type: ${typeof value}`);
}

function toFsFields(obj: Record<string, unknown>): Record<string, FsValue> {
  const fields: Record<string, FsValue> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value === undefined) continue;
    fields[key] = toFsValue(value);
  }
  return fields;
}

function fromFsValue(value: FsValue): unknown {
  if ("stringValue" in value) return value.stringValue;
  if ("integerValue" in value) return Number(value.integerValue);
  if ("doubleValue" in value) return value.doubleValue;
  if ("booleanValue" in value) return value.booleanValue;
  if ("nullValue" in value) return null;
  if ("timestampValue" in value) return value.timestampValue;
  if ("arrayValue" in value) return (value.arrayValue.values ?? []).map(fromFsValue);
  if ("mapValue" in value) return fromFsFields(value.mapValue.fields ?? {});
  return null;
}

function fromFsFields(fields: Record<string, FsValue>): Record<string, unknown> {
  const obj: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(fields)) obj[key] = fromFsValue(value);
  return obj;
}

export type FsDoc = { id: string; data: Record<string, unknown> };

function parseDoc(raw: { name: string; fields?: Record<string, FsValue> }): FsDoc {
  const id = raw.name.split("/").pop() as string;
  return { id, data: fromFsFields(raw.fields ?? {}) };
}

// --- Public API ---------------------------------------------------------

async function getDocUncached(collection: string, id: string): Promise<FsDoc | null> {
  const res = await fsFetch(`${FIRESTORE_HOST}/${basePath()}/${collection}/${id}`);
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`Firestore getDoc(${collection}/${id}) failed: ${res.status}`);
  return parseDoc(await res.json());
}

/**
 * Reads several documents (possibly across collections) in a single request
 * via Firestore's `:batchGet`, instead of one `getDoc` round trip each —
 * missing documents come back as `null` at their original index.
 */
export async function batchGetDocs(
  refs: { collection: string; id: string }[]
): Promise<(FsDoc | null)[]> {
  if (refs.length === 0) return [];
  const documents = refs.map((r) => `${basePath()}/${r.collection}/${r.id}`);
  const res = await fsFetch(`${FIRESTORE_HOST}/${basePath()}:batchGet`, {
    method: "POST",
    body: JSON.stringify({ documents }),
  });
  if (!res.ok) throw new Error(`Firestore batchGetDocs failed: ${res.status} ${await res.text()}`);
  const results = (await res.json()) as { found?: { name: string; fields?: Record<string, FsValue> }; missing?: string }[];

  const byName = new Map<string, FsDoc | null>();
  for (const r of results) {
    if (r.found) byName.set(r.found.name, parseDoc(r.found));
    else if (r.missing) byName.set(r.missing, null);
  }
  return documents.map((name) => byName.get(name) ?? null);
}

async function listCollectionUncached(
  collection: string,
  opts?: { orderBy?: string; direction?: "ASCENDING" | "DESCENDING"; limit?: number }
): Promise<FsDoc[]> {
  const base = `${FIRESTORE_HOST}/${basePath()}/${collection}`;
  const params = new URLSearchParams();
  if (opts?.orderBy) {
    params.set("orderBy", `${opts.orderBy} ${opts.direction === "DESCENDING" ? "desc" : "asc"}`);
  }
  // Documents here can carry sizeable base64 image fields — an unbounded
  // collection fetches (and holds in memory) every document, every time,
  // regardless of how many are actually rendered. `limit` stops paging once
  // enough documents are in hand instead of always pulling the whole thing.
  if (opts?.limit) params.set("pageSize", String(opts.limit));

  const docs: FsDoc[] = [];
  let pageToken: string | undefined;
  for (;;) {
    if (pageToken) params.set("pageToken", pageToken);
    const qs = params.toString();
    const res = await fsFetch(`${base}${qs ? `?${qs}` : ""}`);
    if (!res.ok) throw new Error(`Firestore listCollection(${collection}) failed: ${res.status}`);
    const data = (await res.json()) as {
      documents?: { name: string; fields?: Record<string, FsValue> }[];
      nextPageToken?: string;
    };
    for (const raw of data.documents ?? []) docs.push(parseDoc(raw));
    if (opts?.limit && docs.length >= opts.limit) return docs.slice(0, opts.limit);
    if (!data.nextPageToken) break;
    pageToken = data.nextPageToken;
  }
  return docs;
}

/*
 * Reads are memoized for the duration of one server render (React `cache`),
 * never across requests. A single page render asks for the same documents from
 * several components (e.g. the homepage reads the agent list four times and the
 * stats document three times); without this each is a separate Firestore round
 * trip plus JSON decode, which is the bulk of the CPU time per request.
 * Outside a render (route handlers / admin mutations) `cache` is a pass-through,
 * so writes always read fresh data.
 */
const getDocMemo = cache((collection: string, id: string) => getDocUncached(collection, id));

export function getDoc(collection: string, id: string): Promise<FsDoc | null> {
  return getDocMemo(collection, id);
}

const listCollectionMemo = cache(
  (collection: string, orderBy: string, direction: "ASCENDING" | "DESCENDING", limit: number) =>
    listCollectionUncached(collection, {
      orderBy: orderBy || undefined,
      direction,
      limit: limit || undefined,
    })
);

export function listCollection(
  collection: string,
  opts?: { orderBy?: string; direction?: "ASCENDING" | "DESCENDING"; limit?: number }
): Promise<FsDoc[]> {
  return listCollectionMemo(collection, opts?.orderBy ?? "", opts?.direction ?? "ASCENDING", opts?.limit ?? 0);
}

/** Counts documents in a collection (used to assign the next `order` index). */
export async function countCollection(collection: string): Promise<number> {
  return (await listCollection(collection)).length;
}

/** Creates a new document with an auto-generated ID. Returns the new ID. */
export async function addDoc(collection: string, data: Record<string, unknown>): Promise<string> {
  const res = await fsFetch(`${FIRESTORE_HOST}/${basePath()}/${collection}`, {
    method: "POST",
    body: JSON.stringify({ fields: toFsFields(data) }),
  });
  if (!res.ok) throw new Error(`Firestore addDoc(${collection}) failed: ${res.status}`);
  const raw = (await res.json()) as { name: string };
  return raw.name.split("/").pop() as string;
}

/**
 * Merges the given fields into a document, creating it if it doesn't exist
 * (matches the Admin SDK's `set(data, { merge: true })`).
 */
export async function setDocMerge(
  collection: string,
  id: string,
  data: Record<string, unknown>
): Promise<void> {
  const params = new URLSearchParams();
  for (const key of Object.keys(data)) params.append("updateMask.fieldPaths", key);
  const res = await fsFetch(
    `${FIRESTORE_HOST}/${basePath()}/${collection}/${id}?${params.toString()}`,
    { method: "PATCH", body: JSON.stringify({ fields: toFsFields(data) }) }
  );
  if (!res.ok) throw new Error(`Firestore setDocMerge(${collection}/${id}) failed: ${res.status}`);
}

export async function deleteDoc(collection: string, id: string): Promise<void> {
  const res = await fsFetch(`${FIRESTORE_HOST}/${basePath()}/${collection}/${id}`, {
    method: "DELETE",
  });
  if (!res.ok && res.status !== 404) {
    throw new Error(`Firestore deleteDoc(${collection}/${id}) failed: ${res.status}`);
  }
}

/**
 * Atomically increments numeric fields across one or more documents in a
 * single `:commit` call. Uses Firestore's `updateTransforms` alongside an
 * empty `update`/`updateMask`, so no plain fields are overwritten — only the
 * transforms apply — and the document (or any missing field) is created if
 * it doesn't exist yet.
 */
export async function incrementFieldsMulti(
  writes: { collection: string; id: string; deltas: Record<string, number> }[]
): Promise<void> {
  if (writes.length === 0) return;
  const body = {
    writes: writes.map(({ collection, id, deltas }) => ({
      update: { name: `${basePath()}/${collection}/${id}` },
      updateMask: { fieldPaths: [] },
      updateTransforms: Object.entries(deltas).map(([fieldPath, delta]) => ({
        fieldPath,
        increment: { integerValue: String(delta) },
      })),
    })),
  };
  const res = await fsFetch(`${FIRESTORE_HOST}/${basePath()}:commit`, {
    method: "POST",
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    throw new Error(`Firestore incrementFieldsMulti failed: ${res.status} ${await res.text()}`);
  }
}

type WriteSpec =
  | { collection: string; id: string; data: Record<string, unknown>; requireAbsent?: boolean }
  | { collection: string; id: string; delete: true };

/**
 * Applies multiple writes atomically via Firestore's :commit endpoint.
 * `requireAbsent: true` makes a write fail (silently, as part of the
 * all-or-nothing commit) if the document already exists — used to make
 * one-time seeding race-safe without a real transaction.
 */
export async function commitWrites(writes: WriteSpec[]): Promise<void> {
  const name = (collection: string, id: string) => `${basePath()}/${collection}/${id}`;
  const body = {
    writes: writes.map((w) =>
      "delete" in w
        ? { delete: name(w.collection, w.id) }
        : {
            update: { name: name(w.collection, w.id), fields: toFsFields(w.data) },
            ...(w.requireAbsent ? { currentDocument: { exists: false } } : {}),
          }
    ),
  };
  const res = await fsFetch(`${FIRESTORE_HOST}/${basePath()}:commit`, {
    method: "POST",
    body: JSON.stringify(body),
  });
  // A failed precondition (doc already exists) is expected/benign for
  // requireAbsent writes racing another request — not a real error.
  if (!res.ok && res.status !== 409) {
    throw new Error(`Firestore commitWrites failed: ${res.status} ${await res.text()}`);
  }
}
