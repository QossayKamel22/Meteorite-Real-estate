import "server-only";
import { getFirebaseAuth } from "next-firebase-auth-edge/lib/auth";
import { getDoc, listCollection, setDocMerge } from "@/lib/firestore-rest";
import { authApiKey, authServiceAccount } from "@/lib/edge-auth-config";

export type Role = "admin" | "user";

export type AppUser = {
  uid: string;
  name: string | null;
  email: string | null;
  photoURL: string | null;
  role: Role;
  provider: string;
  disabled: boolean;
  createdAt: string | null;
  lastLoginAt: string | null;
};

const COLLECTION = "users";

function auth() {
  return getFirebaseAuth({ serviceAccount: authServiceAccount, apiKey: authApiKey });
}

function toPlainUser(uid: string, data: Record<string, unknown>): AppUser {
  return {
    uid,
    name: (data.name as string) ?? null,
    email: (data.email as string) ?? null,
    photoURL: (data.photoURL as string) ?? null,
    role: data.role === "admin" ? "admin" : "user",
    provider: (data.provider as string) ?? "unknown",
    disabled: data.disabled === true,
    createdAt: (data.createdAt as string) ?? null,
    lastLoginAt: (data.lastLoginAt as string) ?? null,
  };
}

/**
 * Called right after a client verifies its Firebase ID token against our
 * server (see /api/auth/provision). Creates the user's Firestore profile on
 * first sign-in, or refreshes name/photo/lastLoginAt on subsequent ones.
 *
 * The very first person to sign in with the email in INITIAL_ADMIN_EMAIL is
 * bootstrapped as admin automatically — there is no other way to create the
 * first admin, since admin status is otherwise only grantable by an
 * existing admin via the Users panel.
 */
export async function upsertUserOnSignIn(params: {
  uid: string;
  name: string | null;
  email: string | null;
  photoURL: string | null;
  provider: string;
}): Promise<AppUser> {
  const existing = await getDoc(COLLECTION, params.uid);

  const bootstrapEmail = process.env.INITIAL_ADMIN_EMAIL?.toLowerCase().trim();
  const isBootstrapAdmin = Boolean(
    bootstrapEmail && params.email && params.email.toLowerCase() === bootstrapEmail
  );
  const now = new Date().toISOString();

  if (!existing) {
    const role: Role = isBootstrapAdmin ? "admin" : "user";
    await setDocMerge(COLLECTION, params.uid, {
      name: params.name,
      email: params.email,
      photoURL: params.photoURL,
      provider: params.provider,
      role,
      disabled: false,
      createdAt: now,
      lastLoginAt: now,
    });
    if (role === "admin") {
      await auth().setCustomUserClaims(params.uid, { admin: true });
    }
  } else {
    const shouldBeAdmin = existing.data.role === "admin" || isBootstrapAdmin;
    await setDocMerge(COLLECTION, params.uid, {
      name: params.name,
      email: params.email,
      photoURL: params.photoURL,
      lastLoginAt: now,
      ...(shouldBeAdmin && existing.data.role !== "admin" ? { role: "admin" as Role } : {}),
    });
    if (shouldBeAdmin) {
      const authUser = await auth().getUser(params.uid);
      if (!authUser?.customClaims?.admin) {
        await auth().setCustomUserClaims(params.uid, { admin: true });
      }
    }
  }

  const fresh = await getDoc(COLLECTION, params.uid);
  return toPlainUser(params.uid, fresh!.data);
}

export async function listUsers(): Promise<AppUser[]> {
  const docs = await listCollection(COLLECTION, { orderBy: "createdAt", direction: "DESCENDING" });
  return docs.map((d) => toPlainUser(d.id, d.data));
}

/** Grants or revokes admin access. Keeps the Firestore role and the Auth custom claim in sync. */
export async function setUserRole(uid: string, role: Role): Promise<void> {
  await setDocMerge(COLLECTION, uid, { role });
  await auth().setCustomUserClaims(uid, role === "admin" ? { admin: true } : null);
}

/**
 * Disables/re-enables a user's ability to sign in, without deleting their
 * data. Google's own token-refresh endpoint refuses to renew a disabled
 * user's session, so this takes effect within that session's current token
 * lifetime (up to ~1 hour) rather than instantly revoking it.
 */
export async function setUserDisabled(uid: string, disabled: boolean): Promise<void> {
  await setDocMerge(COLLECTION, uid, { disabled });
  await auth().updateUser(uid, { disabled });
}
