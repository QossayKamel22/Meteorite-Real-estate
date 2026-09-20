import "server-only";

/**
 * Shared config for next-firebase-auth-edge, used by the proxy (middleware),
 * server-side token reads, and admin user-management calls. Runs entirely on
 * Web Crypto + fetch, so — unlike firebase-admin — it works in Cloudflare
 * Workers.
 */
export const authApiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY as string;

export const authCookieName = "meteorite_auth";

export const authCookieSignatureKeys = [
  process.env.AUTH_COOKIE_SIGNATURE_KEY_CURRENT as string,
  process.env.AUTH_COOKIE_SIGNATURE_KEY_PREVIOUS as string,
].filter(Boolean);

export const authCookieSerializeOptions = {
  path: "/",
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  maxAge: 14 * 24 * 60 * 60, // 14 days, seconds
};

export const authServiceAccount = {
  projectId: process.env.FIREBASE_ADMIN_PROJECT_ID as string,
  clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL as string,
  privateKey: (process.env.FIREBASE_ADMIN_PRIVATE_KEY ?? "").replace(/\\n/g, "\n"),
};
