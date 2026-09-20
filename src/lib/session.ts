import "server-only";
import { cookies } from "next/headers";
import { getTokens } from "next-firebase-auth-edge";
import {
  authApiKey,
  authCookieName,
  authCookieSignatureKeys,
  authServiceAccount,
} from "@/lib/edge-auth-config";

export type SessionUser = {
  uid: string;
  email: string | null;
  admin: boolean;
};

/** For use in Server Components / Route Handlers. */
export async function getSessionUser(): Promise<SessionUser | null> {
  const tokens = await getTokens(await cookies(), {
    apiKey: authApiKey,
    cookieName: authCookieName,
    cookieSignatureKeys: authCookieSignatureKeys,
    serviceAccount: authServiceAccount,
  });
  if (!tokens) return null;

  const { decodedToken } = tokens;
  return {
    uid: decodedToken.uid,
    email: decodedToken.email ?? null,
    admin: decodedToken.admin === true,
  };
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
