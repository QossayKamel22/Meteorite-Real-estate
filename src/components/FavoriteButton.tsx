"use client";

import { Heart } from "lucide-react";
import { useFavorites } from "@/lib/favorites-context";

/** The heart on a listing. Saved on this device, and on the account when signed in (see favorites-context). */
export default function FavoriteButton({ id, className = "", label = false }: { id: string; className?: string; label?: boolean }) {
  const { isFavorite, toggleFavorite, hydrated } = useFavorites();
  const on = hydrated && isFavorite(id);
  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleFavorite(id);
      }}
      aria-pressed={on}
      aria-label={on ? "Remove from saved" : "Save this property"}
      className={`inline-flex items-center justify-center gap-1.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold ${className}`}
    >
      <Heart size={17} className={`transition-all duration-300 ${on ? "scale-110 fill-red-500 text-red-500" : ""}`} />
      {label && <span className="text-sm font-semibold">{on ? "Saved" : "Save"}</span>}
    </button>
  );
}
