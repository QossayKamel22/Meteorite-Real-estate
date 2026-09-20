import "server-only";
import { FieldValue } from "firebase-admin/firestore";
import { adminDb, adminAuth } from "@/lib/firebase-admin";

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

type Timestamped = { toDate?: () => Date };

function toPlainUser(uid: string, data: FirebaseFirestore.DocumentData): AppUser {
  const createdAt = data.createdAt as Timestamped | undefined;
  const lastLoginAt = data.lastLoginAt as Timestamped | undefined;
  return {
    uid,
    name: data.name ?? null,
    email: data.email ?? null,
    photoURL: data.photoURL ?? null,
    role: data.role === "admin" ? "admin" : "user",
    provider: data.provider ?? "unknown",
    disabled: data.disabled === true,
    createdAt: createdAt?.toDate ? createdAt.toDate().toISOString() : null,
    lastLoginAt: lastLoginAt?.toDate ? lastLoginAt.toDate().toISOString() : null,
  };
}

/**
 * Called right after a client verifies its Firebase ID token against our
 * server (see /api/auth/session). Creates the user's Firestore profile on
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
  const ref = adminDb.collection(COLLECTION).doc(params.uid);
  const snap = await ref.get();

  const bootstrapEmail = process.env.INITIAL_ADMIN_EMAIL?.toLowerCase().trim();
  const isBootstrapAdmin = Boolean(
    bootstrapEmail && params.email && params.email.toLowerCase() === bootstrapEmail
  );

  if (!snap.exists) {
    const role: Role = isBootstrapAdmin ? "admin" : "user";
    await ref.set({
      name: params.name,
      email: params.email,
      photoURL: params.photoURL,
      provider: params.provider,
      role,
      disabled: false,
      createdAt: FieldValue.serverTimestamp(),
      lastLoginAt: FieldValue.serverTimestamp(),
    });
    if (role === "admin") {
      await adminAuth.setCustomUserClaims(params.uid, { admin: true });
    }
  } else {
    const existing = snap.data() ?? {};
    const shouldBeAdmin = existing.role === "admin" || isBootstrapAdmin;
    await ref.set(
      {
        name: params.name,
        email: params.email,
        photoURL: params.photoURL,
        lastLoginAt: FieldValue.serverTimestamp(),
        ...(shouldBeAdmin && existing.role !== "admin" ? { role: "admin" as Role } : {}),
      },
      { merge: true }
    );
    if (shouldBeAdmin) {
      const authUser = await adminAuth.getUser(params.uid);
      if (authUser.customClaims?.admin !== true) {
        await adminAuth.setCustomUserClaims(params.uid, { admin: true });
      }
    }
  }

  const fresh = await ref.get();
  return toPlainUser(params.uid, fresh.data()!);
}

export async function listUsers(): Promise<AppUser[]> {
  const snap = await adminDb.collection(COLLECTION).orderBy("createdAt", "desc").get();
  return snap.docs.map((d) => toPlainUser(d.id, d.data()));
}

/** Grants or revokes admin access. Keeps the Firestore role and the Auth custom claim in sync. */
export async function setUserRole(uid: string, role: Role): Promise<void> {
  await adminDb.collection(COLLECTION).doc(uid).set({ role }, { merge: true });
  await adminAuth.setCustomUserClaims(uid, role === "admin" ? { admin: true } : {});
}

/** Disables/re-enables a user's ability to sign in, without deleting their data. */
export async function setUserDisabled(uid: string, disabled: boolean): Promise<void> {
  await adminDb.collection(COLLECTION).doc(uid).set({ disabled }, { merge: true });
  await adminAuth.updateUser(uid, { disabled });
  if (disabled) {
    // Also invalidates any existing session cookie immediately (verifySessionCookie
    // is called with checkRevoked=true), not just future sign-in attempts.
    await adminAuth.revokeRefreshTokens(uid);
  }
}
