"use client";

import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut as firebaseSignOut,
  updateProfile,
  type User,
} from "firebase/auth";
import { auth, googleProvider, isFirebaseConfigured } from "@/lib/firebase-client";

export type AuthUser = {
  uid: string;
  name: string | null;
  email: string | null;
  photoURL: string | null;
};

export type Role = "admin" | "user";

type AuthContextValue = {
  user: AuthUser | null;
  role: Role | null;
  loading: boolean;
  /** True while a sign-in/register/sign-out action is in flight — drives the app-wide loading overlay. */
  actionLoading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  registerWithEmail: (name: string, email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  error: string | null;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function mapUser(user: User | null): AuthUser | null {
  if (!user) return null;
  return {
    uid: user.uid,
    name: user.displayName,
    email: user.email,
    photoURL: user.photoURL,
  };
}

function mapAuthErrorCode(code: string | undefined): string {
  switch (code) {
    case "auth/email-already-in-use":
      return "An account with this email already exists — try signing in instead.";
    case "auth/invalid-email":
      return "Please enter a valid email address.";
    case "auth/weak-password":
      return "Password must be at least 6 characters.";
    case "auth/wrong-password":
    case "auth/invalid-credential":
      return "Incorrect email or password.";
    case "auth/user-not-found":
      return "No account found with that email.";
    case "auth/too-many-requests":
      return "Too many attempts. Please try again later.";
    case "auth/operation-not-allowed":
      return "Email sign-in isn't enabled for this project yet.";
    default:
      return "Something went wrong. Please try again.";
  }
}

/**
 * Exchanges the client's Firebase ID token for a server-side session cookie
 * (see /api/auth/session) and provisions the Firestore user profile. This is
 * what determines admin access — there is no separate admin login.
 */
async function syncServerSession(firebaseUser: User): Promise<Role | null> {
  try {
    const idToken = await firebaseUser.getIdToken();
    const res = await fetch("/api/auth/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.role === "admin" ? "admin" : "user";
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [role, setRole] = useState<Role | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // registerWithEmail sets a display name right after account creation, but
  // that creation already fires this listener (with the pre-rename user) —
  // without suppression, the automatic sync below would race the manual
  // re-sync at the end of registerWithEmail and could win with a null name.
  const suppressAutoSyncRef = useRef(false);

  useEffect(() => {
    if (!isFirebaseConfigured) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time config check, not derived from props/state
      setLoading(false);
      return;
    }
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(mapUser(firebaseUser));
      if (!suppressAutoSyncRef.current) {
        if (firebaseUser) {
          const r = await syncServerSession(firebaseUser);
          setRole(r);
        } else {
          setRole(null);
        }
        // Whatever action (sign-in, sign-out) triggered this change, the
        // transition is now fully settled — including the role lookup —
        // so it's safe to drop the loading overlay here.
        setActionLoading(false);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const signInWithGoogle = async () => {
    setError(null);
    if (!isFirebaseConfigured) {
      setError("Sign-in isn't configured on this deployment yet.");
      return;
    }
    setActionLoading(true);
    try {
      await signInWithPopup(auth, googleProvider);
      // onAuthStateChanged clears actionLoading once the session sync completes.
    } catch (err) {
      const code = (err as { code?: string })?.code;
      setActionLoading(false);
      if (code === "auth/popup-closed-by-user" || code === "auth/cancelled-popup-request") return;
      setError(mapAuthErrorCode(code));
    }
  };

  const signInWithEmail = async (email: string, password: string) => {
    setError(null);
    if (!isFirebaseConfigured) {
      setError("Sign-in isn't configured on this deployment yet.");
      return;
    }
    setActionLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
      setActionLoading(false);
      setError(mapAuthErrorCode((err as { code?: string })?.code));
    }
  };

  const registerWithEmail = async (name: string, email: string, password: string) => {
    setError(null);
    if (!isFirebaseConfigured) {
      setError("Sign-in isn't configured on this deployment yet.");
      return;
    }
    setActionLoading(true);
    suppressAutoSyncRef.current = true;
    try {
      const credential = await createUserWithEmailAndPassword(auth, email, password);
      if (name.trim()) {
        await updateProfile(credential.user, { displayName: name.trim() });
      }
      // The listener's automatic sync is suppressed above, so this is the
      // only sync call for registration — it runs after the display name is
      // set, so Firestore gets the name instead of racing a null one.
      setUser(mapUser(credential.user));
      const r = await syncServerSession(credential.user);
      setRole(r);
    } catch (err) {
      setError(mapAuthErrorCode((err as { code?: string })?.code));
    } finally {
      suppressAutoSyncRef.current = false;
      setActionLoading(false);
    }
  };

  const signOut = async () => {
    setError(null);
    setActionLoading(true);
    try {
      await fetch("/api/auth/session", { method: "DELETE" });
    } catch {
      // best-effort — still sign out of the client SDK below
    }
    await firebaseSignOut(auth);
    // onAuthStateChanged clears actionLoading once it processes the sign-out.
  };

  const value = useMemo(
    () => ({
      user,
      role,
      loading,
      actionLoading,
      signInWithGoogle,
      signInWithEmail,
      registerWithEmail,
      signOut,
      error,
    }),
    [user, role, loading, actionLoading, error]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
