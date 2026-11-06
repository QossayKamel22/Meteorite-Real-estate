"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "@/lib/auth-context";

const STORAGE_KEY = "meteorite:favorites";

type FavoritesContextValue = {
  favorites: string[];
  isFavorite: (id: string) => boolean;
  toggleFavorite: (id: string) => void;
  hydrated: boolean;
};

const FavoritesContext = createContext<FavoritesContextValue | null>(null);

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const [favorites, setFavorites] = useState<string[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const { user } = useAuth();
  const uid = user?.uid ?? null;
  const syncTimer = useRef<number | undefined>(undefined);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time hydration from localStorage, not derived from props/state
      if (raw) setFavorites(JSON.parse(raw));
    } catch {
      // localStorage unavailable (private mode, disabled storage) — fall back to empty list
    } finally {
      setHydrated(true);
    }
  }, []);

  const push = useCallback((ids: string[]) => {
    window.clearTimeout(syncTimer.current);
    syncTimer.current = window.setTimeout(() => {
      fetch("/api/favorites", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ids }) }).catch(() => undefined);
    }, 600);
  }, []);

  // Signing in merges what is saved on this device with what is saved on the account, then keeps both the same.
  useEffect(() => {
    if (!hydrated || !uid) return;
    let cancelled = false;
    fetch("/api/favorites")
      .then((r) => (r.ok ? r.json() : null))
      .then((d: { ids?: string[] } | null) => {
        if (cancelled || !d?.ids) return;
        setFavorites((local) => {
          const merged = [...new Set([...d.ids!, ...local])];
          try {
            window.localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
          } catch {
            /* ignore */
          }
          if (merged.length !== d.ids!.length) push(merged);
          return merged;
        });
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [hydrated, uid, push]);

  const toggleFavorite = useCallback(
    (id: string) => {
      setFavorites((prev) => {
        const next = prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id];
        try {
          window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        } catch {
          // ignore persistence failure; in-memory state still updates for this session
        }
        if (uid) push(next);
        return next;
      });
    },
    [uid, push]
  );

  const isFavorite = useCallback((id: string) => favorites.includes(id), [favorites]);

  const value = useMemo(
    () => ({ favorites, isFavorite, toggleFavorite, hydrated }),
    [favorites, isFavorite, toggleFavorite, hydrated]
  );

  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>;
}

export function useFavorites() {
  const ctx = useContext(FavoritesContext);
  if (!ctx) throw new Error("useFavorites must be used within FavoritesProvider");
  return ctx;
}
