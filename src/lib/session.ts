import "server-only";
import { cookies } from "next/headers";
import { adminAuth, adminDb } from "@/lib/firebase-admin";

export const SESSION_COOKIE = "meteorite_session";
const SESSION_MAX_AGE_MS = 14 * 24 * 60 * 60 * 1000; // 14 days
export const SESSION_MAX_AGE_SECONDS = SESSION_MAX_AGE_MS / 1000;

export type SessionUser = {
  uid: string;
  email: string | null;
  admin: boolean;
};

/** Mints a Firebase session cookie from a freshly-verified client ID token. */
export async function createSessionCookieFromIdToken(idToken: string): Promise<string> {
  return adminAuth.createSessionCookie(idToken, { expiresIn: SESSION_MAX_AGE_MS });
}

/**
 * Verifies a session cookie value and resolves the admin role by reading
 * `users/{uid}.role` from Firestore directly (rather than trusting a custom
 * claim baked into the cookie), so a role change takes effect on the very
 * next request instead of waiting for the client to refresh its ID token.
 */
export async function resolveSessionUser(cookieValue: string | undefined): Promise<SessionUser | null> {
  if (!cookieValue) return null;
  try {
    const decoded = await adminAuth.verifySessionCookie(cookieValue, true);
    const snap = await adminDb.collection("users").doc(decoded.uid).get();
    const admin = snap.exists && snap.data()?.role === "admin";
    return { uid: decoded.uid, email: decoded.email ?? null, admin };
  } catch {
    return null;
  }
}

/** For use in Server Components / Route Handlers (reads the cookie via next/headers). */
export async function getSessionUser(): Promise<SessionUser | null> {
  const store = await cookies();
  return resolveSessionUser(store.get(SESSION_COOKIE)?.value);
}

/** Shared guard for API route handlers: is the current request an authenticated admin? */
export async function requireAdmin(): Promise<boolean> {
  const user = await getSessionUser();
  return Boolean(user?.admin);
}

/**
 * Defense-in-depth against CSRF for state-changing requests, on top of the
 * SameSite=Lax session cookie. Rejects cross-origin POST/PUT/DELETE calls
 * even if a browser's SameSite handling is bypassed or misconfigured.
 */
export function hasTrustedOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return true; // same-origin requests from older browsers may omit Origin
  try {
    return new URL(origin).host === new URL(request.url).host;
  } catch {
    return false;
  }
}
