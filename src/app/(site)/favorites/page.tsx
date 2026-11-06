"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Heart } from "lucide-react";
import { useFavorites } from "@/lib/favorites-context";
import { useAuth } from "@/lib/auth-context";
import { externalListings } from "@/lib/content";
import type { Property } from "@/lib/properties-data";
import PropertyCard from "@/components/PropertyCard";
import SectionHeading from "@/components/SectionHeading";

export default function FavoritesPage() {
  const { favorites, hydrated } = useFavorites();
  const { user } = useAuth();
  const [items, setItems] = useState<Property[] | null>(null);

  const key = favorites.join(",");
  useEffect(() => {
    if (!hydrated) return;
    if (!key) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- nothing saved: nothing to fetch
      setItems([]);
      return;
    }
    let live = true;
    fetch(`/api/properties?ids=${encodeURIComponent(key)}`)
      .then((r) => r.json())
      .then((d: { items?: Property[] }) => live && setItems(d.items ?? []))
      .catch(() => live && setItems([]));
    return () => {
      live = false;
    };
  }, [hydrated, key]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
      <SectionHeading kicker="Saved" title="Your saved properties" as="h1" />
      <p className="mt-3 max-w-xl text-sm leading-relaxed text-brand-ink/70">
        {user ? "Synced with your account, so they are here on every device you sign in on." : <>Saved on this device. <Link prefetch={false} href="/login?redirect=/favorites" className="font-semibold text-gold-ink underline">Sign in</Link> to keep them on every device.</>}
      </p>

      {hydrated && items !== null && items.length === 0 && (
        <div className="mt-10 rounded-2xl border border-dashed border-brand-line p-10 text-center">
          <Heart className="mx-auto text-brand-gold" size={28} />
          <p className="mt-3 text-brand-ink/70">You haven&apos;t saved any properties yet. Tap the heart on a listing to keep it here.</p>
          <div className="mt-5 flex flex-col justify-center gap-3 sm:flex-row">
            <Link prefetch={false} href="/for-sale" className="rounded-full bg-brand-navy px-6 py-3 text-sm font-semibold text-white hover:bg-brand-navy-light">Browse for sale</Link>
            <Link prefetch={false} href="/for-rent" className="rounded-full border border-brand-line px-6 py-3 text-sm font-semibold text-heading hover:border-brand-gold">Browse for rent</Link>
            <a href={externalListings.bayutCompanyForSale} target="_blank" rel="noopener noreferrer" className="rounded-full border border-brand-line px-6 py-3 text-sm font-semibold text-heading hover:border-brand-gold">Full portfolio on Bayut</a>
          </div>
        </div>
      )}

      {items && items.length > 0 && (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((p, i) => (
            <PropertyCard key={p.id} property={p} delay={Math.min(i, 5) * 0.06} />
          ))}
        </div>
      )}
    </div>
  );
}
