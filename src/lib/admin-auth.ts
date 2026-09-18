import "server-only";
import { SignJWT, jwtVerify } from "jose";

export const ADMIN_SESSION_COOKIE = "meteorite_admin_session";
const SESSION_DURATION_SECONDS = 8 * 60 * 60; // 8 hours

function getSecretKey(): Uint8Array {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret || secret.length < 16) {
    throw new Error(
      "ADMIN_SESSION_SECRET is not set (or too short). Set it in your environment to enable admin login."
    );
  }
  return new TextEncoder().encode(secret);
}

/** Whether the admin feature is configured at all (both env vars present). */
export function isAdminConfigured(): boolean {
  return Boolean(process.env.ADMIN_PASSWORD && process.env.ADMIN_SESSION_SECRET);
}

export async function createAdminSessionToken(): Promise<string> {
  return new SignJWT({ role: "admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DURATION_SECONDS}s`)
    .sign(getSecretKey());
}

export async function verifyAdminSessionToken(token: string | undefined): Promise<boolean> {
  if (!token) return false;
  try {
    const { payload } = await jwtVerify(token, getSecretKey());
    return payload.role === "admin";
  } catch {
    return false;
  }
}

export const ADMIN_SESSION_MAX_AGE = SESSION_DURATION_SECONDS;

/**
 * Defense-in-depth against CSRF for state-changing admin requests, on top
 * of the SameSite=Lax session cookie. Rejects cross-origin POST/PUT calls
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
