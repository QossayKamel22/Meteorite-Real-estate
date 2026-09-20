import { NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebase-admin";
import {
  createSessionCookieFromIdToken,
  hasTrustedOrigin,
  SESSION_COOKIE,
  SESSION_MAX_AGE_SECONDS,
} from "@/lib/session";
import { upsertUserOnSignIn } from "@/lib/users-data";
import { isRateLimited, getClientKey } from "@/lib/rate-limit";

/**
 * Exchanges a client-side Firebase ID token (from Google sign-in) for a
 * server-side session cookie, and provisions/refreshes the user's Firestore
 * profile. This is the ONLY way an admin session gets established — there is
 * no separate admin password or login form. Whether the signed-in account is
 * an admin is decided entirely by `users/{uid}.role` in Firestore.
 */
export async function POST(request: Request) {
  if (!hasTrustedOrigin(request)) {
    return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
  }

  const clientKey = getClientKey(request);
  if (isRateLimited(clientKey)) {
    return NextResponse.json({ error: "Too many attempts. Please try again shortly." }, { status: 429 });
  }

  let idToken: unknown;
  try {
    const body = await request.json();
    idToken = body?.idToken;
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  if (typeof idToken !== "string" || !idToken) {
    return NextResponse.json({ error: "Missing sign-in token." }, { status: 400 });
  }

  let decoded;
  try {
    decoded = await adminAuth.verifyIdToken(idToken);
  } catch {
    return NextResponse.json({ error: "Invalid or expired sign-in token." }, { status: 401 });
  }

  if (decoded.firebase?.sign_in_provider === undefined) {
    return NextResponse.json({ error: "Unrecognized sign-in provider." }, { status: 401 });
  }

  const user = await upsertUserOnSignIn({
    uid: decoded.uid,
    name: typeof decoded.name === "string" ? decoded.name : null,
    email: decoded.email ?? null,
    photoURL: typeof decoded.picture === "string" ? decoded.picture : null,
    provider: decoded.firebase.sign_in_provider,
  });

  let sessionCookie: string;
  try {
    sessionCookie = await createSessionCookieFromIdToken(idToken);
  } catch {
    return NextResponse.json({ error: "Could not start a session." }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true, role: user.role });
  response.cookies.set(SESSION_COOKIE, sessionCookie, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
  return response;
}

export async function DELETE(request: Request) {
  if (!hasTrustedOrigin(request)) {
    return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
  }
  const response = NextResponse.json({ ok: true });
  response.cookies.set(SESSION_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  return response;
}
