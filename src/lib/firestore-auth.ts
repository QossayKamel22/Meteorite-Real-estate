/**
 * Service-account auth for the Firestore REST API, shared by the data layer
 * (firestore-rest.ts, server components / route handlers) and by the visit
 * beacon handled in the edge middleware (track-visit.ts). Deliberately free of
 * `server-only` and `react` so it can be bundled into the middleware too.
 *
 * Runs entirely on Web Crypto + fetch (no firebase-admin: it needs raw TCP/gRPC,
 * which Cloudflare Workers doesn't have).
 */

import { getCfContext, getKv } from "@/lib/cf-runtime";

export const FIRESTORE_HOST = "https://firestore.googleapis.com/v1";

function getProjectId(): string {
  const id = process.env.FIREBASE_ADMIN_PROJECT_ID;
  if (!id) throw new Error("FIREBASE_ADMIN_PROJECT_ID is not set.");
  return id;
}

export function basePath(): string {
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

const SHARED_TOKEN_KEY = "app/firestore-access-token";
const SHARED_TOKEN_BINDING = "NEXT_INC_CACHE_KV";

async function readSharedToken(): Promise<{ token: string; expiresAt: number } | null> {
  try {
    const v = (await getKv(SHARED_TOKEN_BINDING)?.get(SHARED_TOKEN_KEY, "json")) as
      | { token?: unknown; expiresAt?: unknown }
      | null
      | undefined;
    if (v && typeof v.token === "string" && typeof v.expiresAt === "number" && v.expiresAt > Date.now() + 120_000) {
      return { token: v.token, expiresAt: v.expiresAt };
    }
  } catch {
    // KV unavailable (or running outside a Worker) — mint a token the normal way.
  }
  return null;
}

function writeSharedToken(token: { token: string; expiresAt: number }): void {
  try {
    const put = getKv(SHARED_TOKEN_BINDING)?.put(SHARED_TOKEN_KEY, JSON.stringify(token), { expirationTtl: 3300 });
    if (put) getCfContext()?.ctx.waitUntil(put.catch(() => undefined));
  } catch {
    // best-effort
  }
}

/** Forget the cached token (e.g. Google answered 401 to it) so the next call mints a fresh one. */
export function invalidateAccessToken(): void {
  cachedToken = null;
  // The shared copy may be the stale one; drop it so the next caller mints a fresh token.
  try {
    const put = getKv(SHARED_TOKEN_BINDING)?.put(SHARED_TOKEN_KEY, "null", { expirationTtl: 60 });
    if (put) getCfContext()?.ctx.waitUntil(put.catch(() => undefined));
  } catch {
    // best-effort
  }
}

/** Upper bound for any single call to Google, so a stalled connection fails fast instead of hanging a request. */
export const GOOGLE_REQUEST_TIMEOUT_MS = 8000;

/**
 * Signs a short-lived JWT with the service account key and exchanges it for a
 * Google OAuth2 access token. The finished token is cached per isolate, but an
 * in-flight request is deliberately NOT shared: a Workers promise tied to one
 * request's I/O can't be awaited from another request — doing so hangs the
 * second request until Cloudflare cancels it (observed as ~50s stalls, outcome
 * "canceled", ~3ms CPU). Concurrent cold requests each fetch their own token.
 */
export async function getAccessToken(): Promise<string> {
  if (cachedToken && cachedToken.expiresAt > Date.now() + 60_000) return cachedToken.token;

  // A cold Worker instance would otherwise import the key, sign a JWT and make a
  // TLS round trip to Google (~70ms of CPU against a ~10ms Free-plan budget) —
  // and a page full of images can start several instances at once. Instances
  // share the finished token through KV instead, so that cost is paid about
  // once an hour for the whole site.
  const shared = await readSharedToken();
  if (shared) {
    cachedToken = shared;
    return shared.token;
  }

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
    signal: AbortSignal.timeout(GOOGLE_REQUEST_TIMEOUT_MS),
  });
  if (!res.ok) {
    throw new Error(`Failed to obtain a Google access token (${res.status}).`);
  }
  const data = (await res.json()) as { access_token: string; expires_in: number };
  cachedToken = { token: data.access_token, expiresAt: Date.now() + data.expires_in * 1000 };
  writeSharedToken(cachedToken);
  return cachedToken.token;
}
