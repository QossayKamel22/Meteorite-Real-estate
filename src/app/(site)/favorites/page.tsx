"use client";

import Link from "next/link";
import { useFavorites } from "@/lib/favorites-context";
import { externalListings } from "@/lib/content";
import Reveal from "@/components/Reveal";
import SectionHeading from "@/components/SectionHeading";

export default function FavoritesPage() {
  const { favorites, hydrated } = useFavorites();

  return (
    <div className="mx-auto max-w-3xl px-4 py-20 sm:px-6 lg:px-8">
      <SectionHeading kicker="Saved" title="Your saved properties" as="h1" />
      <Reveal delay={0.2}>
      <p className="mt-4 text-base leading-relaxed text-brand-ink/60">
        Saved on this device only — favorites aren&apos;t synced across devices until a real
        account backend is connected.
      </p>
      </Reveal>

      {hydrated && favorites.length === 0 && (
        <div className="mt-10 rounded-2xl border border-dashed border-brand-line p-10 text-center">
          <p className="text-brand-ink/60">You haven&apos;t saved any properties yet.</p>
          <div className="mt-5 flex flex-col justify-center gap-3 sm:flex-row">
            <Link prefetch={false}
              href="/for-sale"
              className="rounded-full bg-brand-navy px-6 py-3 text-sm font-semibold text-white hover:bg-brand-navy-light"
            >
              Browse for sale
            </Link>
            <a
              href={externalListings.bayutCompanyForSale}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full border border-brand-line px-6 py-3 text-sm font-semibold text-heading hover:bg-brand-paper"
            >
              View full portfolio
            </a>
          </div>
        </div>
      )}

      {hydrated && favorites.length > 0 && (
        <ul className="mt-10 space-y-3">
          {favorites.map((id) => (
            <li key={id} className="rounded-xl border border-brand-line p-4 text-sm text-brand-ink/70">
              {id}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
