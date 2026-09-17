"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";

type AuthUser = { name: string; email: string };

type AuthContextValue = {
  user: AuthUser | null;
  isGuest: boolean;
  continueAsGuest: () => void;
  signOut: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

/**
 * No authentication backend is connected in this deployment. This provider
 * only tracks guest mode locally so the UI can be built and tested end to
 * end. Wiring `user` to a real signed-in identity requires a backend
 * (e.g. Supabase Auth, NextAuth with a database adapter) — see
 * /login and /register for what's implemented vs. stubbed.
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user] = useState<AuthUser | null>(null);
  const [isGuest, setIsGuest] = useState(true);

  const continueAsGuest = useCallback(() => setIsGuest(true), []);
  const signOut = useCallback(() => setIsGuest(true), []);

  const value = useMemo(
    () => ({ user, isGuest, continueAsGuest, signOut }),
    [user, isGuest, continueAsGuest, signOut]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
