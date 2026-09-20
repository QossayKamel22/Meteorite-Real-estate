"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import {
  onAuthStateChanged,
  signInWithPopup,
  signOut as firebaseSignOut,
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
  signInWithGoogle: () => Promise<void>;
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
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isFirebaseConfigured) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time config check, not derived from props/state
      setLoading(false);
      return;
    }
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(mapUser(firebaseUser));
      if (firebaseUser) {
        syncServerSession(firebaseUser).then(setRole);
      } else {
        setRole(null);
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
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      const code = (err as { code?: string })?.code;
      if (code === "auth/popup-closed-by-user" || code === "auth/cancelled-popup-request") return;
      if (code === "auth/operation-not-allowed") {
        setError("Google sign-in isn't enabled for this project yet.");
        return;
      }
      setError("Sign-in failed. Please try again.");
    }
  };

  const signOut = async () => {
    setError(null);
    try {
      await fetch("/api/auth/session", { method: "DELETE" });
    } catch {
      // best-effort — still sign out of the client SDK below
    }
    await firebaseSignOut(auth);
    setRole(null);
  };

  const value = useMemo(
    () => ({ user, role, loading, signInWithGoogle, signOut, error }),
    [user, role, loading, error]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
