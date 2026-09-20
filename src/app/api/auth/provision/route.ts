import { NextResponse } from "next/server";
import { getFirebaseAuth } from "next-firebase-auth-edge/lib/auth";
import { authApiKey, authServiceAccount } from "@/lib/edge-auth-config";
import { hasTrustedOrigin } from "@/lib/session";
import { upsertUserOnSignIn } from "@/lib/users-data";
import { isRateLimited, getClientKey } from "@/lib/rate-limit";

/**
 * Called by the client right after Firebase sign-in (and right after the
 * proxy's /api/login sets the session cookie): verifies the ID token
 * independently, then provisions/refreshes the Firestore user profile.
 * This is what a signed-in account becomes an admin through — there is no
 * separate admin password or login form.
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
    decoded = await getFirebaseAuth({ serviceAccount: authServiceAccount, apiKey: authApiKey }).verifyIdToken(
      idToken
    );
  } catch {
    return NextResponse.json({ error: "Invalid or expired sign-in token." }, { status: 401 });
  }

  const provider = decoded.firebase?.sign_in_provider;
  if (!provider) {
    return NextResponse.json({ error: "Unrecognized sign-in provider." }, { status: 401 });
  }

  const user = await upsertUserOnSignIn({
    uid: decoded.uid,
    name: typeof decoded.name === "string" ? decoded.name : null,
    email: decoded.email ?? null,
    photoURL: typeof decoded.picture === "string" ? decoded.picture : null,
    provider,
  });

  return NextResponse.json({ ok: true, role: user.role });
}
