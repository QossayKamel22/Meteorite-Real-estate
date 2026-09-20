import "server-only";

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

const FIRESTORE_HOST = "https://firestore.googleapis.com/v1";

function getProjectId(): string {
  const id = process.env.FIREBASE_ADMIN_PROJECT_ID;
  if (!id) throw new Error("FIREBASE_ADMIN_PROJECT_ID is not set.");
  return id;
}

function basePath(): string {
  return `projects/${getProjectId()}/databases/(default)/documents`;
}

function pemToArrayBuffer(pem: string): ArrayBuffer {
  const b64 = pem
    .replace(/-----BEGIN PRIVATE KEY-----/, "")
    .replace(/-----END PRIVATE KEY-----/, "")
    .replace(/\s+/g, "");
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes.buffer;
}

function base64url(input: ArrayBuffer | string): string {
  const bytes = typeof input === "string" ? new TextEncoder().encode(input) : new Uint8Array(input);
  let str = "";
  for (const b of bytes) str += String.fromCharCode(b);
  return btoa(str).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

let cachedKey: CryptoKey | null = null;
async function getSigningKey(): Promise<CryptoKey> {
  if (cachedKey) return cachedKey;
  const privateKey = (process.env.FIREBASE_ADMIN_PRIVATE_KEY ?? "").replace(/\\n/g, "\n");
  if (!privateKey) throw new Error("FIREBASE_ADMIN_PRIVATE_KEY is not set.");
  cachedKey = await crypto.subtle.importKey(
    "pkcs8",
    pemToArrayBuffer(privateKey),
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["sign"]
  );
  return cachedKey;
}

let cachedToken: { token: string; expiresAt: number } | null = null;

/** Signs a short-lived JWT with the service account key and exchanges it for a Google OAuth2 access token. */
async function getAccessToken(): Promise<string> {
  if (cachedToken && cachedToken.expiresAt > Date.now() + 60_000) return cachedToken.token;

  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
  if (!clientEmail) throw new Error("FIREBASE_ADMIN_CLIENT_EMAIL is not set.");

  const now = Math.floor(Date.now() / 1000);
  const header = { alg: "RS256", typ: "JWT" };
  const claims = {
    iss: clientEmail,
    scope: "https://www.googleapis.com/auth/datastore",
    aud: "https://oauth2.googleapis.com/token",
    iat: now,
    exp: now + 3600,
  };
  const unsigned = `${base64url(JSON.stringify(header))}.${base64url(JSON.stringify(claims))}`;
  const key = await getSigningKey();
  const signature = await crypto.subtle.sign(
    "RSASSA-PKCS1-v1_5",
    key,
    new TextEncoder().encode(unsigned)
  );
  const jwt = `${unsigned}.${base64url(signature)}`;

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: jwt,
    }),
  });
  if (!res.ok) {
    throw new Error(`Failed to obtain a Google access token (${res.status}).`);
  }
  const data = (await res.json()) as { access_token: string; expires_in: number };
  cachedToken = { token: data.access_token, expiresAt: Date.now() + data.expires_in * 1000 };
  return cachedToken.token;
}

async function fsFetch(url: string, init?: RequestInit): Promise<Response> {
  const token = await getAccessToken();
  return fetch(url, {
    ...init,
    headers: {
      ...(init?.headers ?? {}),
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
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

export async function getDoc(collection: string, id: string): Promise<FsDoc | null> {
  const res = await fsFetch(`${FIRESTORE_HOST}/${basePath()}/${collection}/${id}`);
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`Firestore getDoc(${collection}/${id}) failed: ${res.status}`);
  return parseDoc(await res.json());
}

export async function listCollection(
  collection: string,
  opts?: { orderBy?: string; direction?: "ASCENDING" | "DESCENDING" }
): Promise<FsDoc[]> {
  const base = `${FIRESTORE_HOST}/${basePath()}/${collection}`;
  const params = new URLSearchParams();
  if (opts?.orderBy) {
    params.set("orderBy", `${opts.orderBy} ${opts.direction === "DESCENDING" ? "desc" : "asc"}`);
  }

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
    if (!data.nextPageToken) break;
    pageToken = data.nextPageToken;
  }
  return docs;
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
