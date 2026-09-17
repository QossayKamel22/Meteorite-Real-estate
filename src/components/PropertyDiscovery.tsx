import Link from "next/link";
import { Building2, Home, Store, Warehouse } from "lucide-react";
import { externalListings } from "@/lib/content";
import Reveal from "@/components/Reveal";

const categories = [
  { label: "Apartments & Studios", icon: Building2, forSale: `${externalListings.bayutForSale}&category=apartment`, forRent: `${externalListings.bayutForRent}&category=apartment` },
  { label: "Villas", icon: Home, forSale: `${externalListings.bayutForSale}&category=villa`, forRent: `${externalListings.bayutForRent}&category=villa` },
  { label: "Townhouses", icon: Warehouse, forSale: `${externalListings.bayutForSale}&category=townhouse`, forRent: `${externalListings.bayutForRent}&category=townhouse` },
  { label: "Commercial", icon: Store, forSale: `${externalListings.bayutForSale}&category=commercial`, forRent: `${externalListings.bayutForRent}&category=commercial` },
];

export default function PropertyDiscovery() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
      <Reveal>
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div className="max-w-xl">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-gold">
              Live Inventory
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-heading sm:text-4xl">
              Explore our current listings
            </h2>
            <p className="mt-3 text-base leading-relaxed text-brand-ink/60">
              Our full, continuously-updated portfolio is hosted on Bayut, our verified listing
              partner — browse by category below or view our complete agency profile.
            </p>
          </div>
          <a
            href={externalListings.bayutCompanyForSale}
            target="_blank"
            rel="noopener noreferrer"
            className="whitespace-nowrap rounded-full bg-brand-navy px-6 py-3 text-sm font-semibold text-white transition-all duration-200 hover:scale-[1.03] hover:bg-brand-navy-light"
          >
            View full agency profile
          </a>
        </div>
      </Reveal>

      <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {categories.map((cat, i) => (
          <Reveal key={cat.label} delay={i * 0.07}>
            <div className="glass shimmer-border group flex h-full flex-col justify-between rounded-2xl p-6 transition-transform duration-300 hover:-translate-y-1">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-brand-gold/15 text-brand-gold">
                <cat.icon size={20} strokeWidth={1.75} />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-heading">{cat.label}</h3>
              <div className="mt-5 flex flex-col gap-2 text-sm font-medium">
                <a
                  href={cat.forSale}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-heading hover:text-brand-gold"
                >
                  For sale <span aria-hidden="true">→</span>
                </a>
                <a
                  href={cat.forRent}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-brand-ink/60 hover:text-brand-gold"
                >
                  For rent <span aria-hidden="true">→</span>
                </a>
              </div>
            </div>
          </Reveal>
        ))}
      </div>

      <p className="mt-6 text-xs text-brand-ink/45">
        Listing links open Bayut in a new tab. Prices, availability and specifications are
        managed live by Bayut and are not duplicated here to avoid displaying outdated
        information.
      </p>

      <div className="mt-4">
        <Link href="/for-sale" className="text-sm font-semibold text-heading hover:text-brand-gold">
          More about buying with Meteorite →
        </Link>
      </div>
    </section>
  );
}
