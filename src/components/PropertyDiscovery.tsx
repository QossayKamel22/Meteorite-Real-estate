import Link from "next/link";
import { ArrowUpRight, Building2, Home, Store, Warehouse } from "lucide-react";
import { externalListings } from "@/lib/content";
import Reveal from "@/components/Reveal";
import SectionHeading from "@/components/SectionHeading";

const categories = [
  { label: "Apartments & Studios", icon: Building2, forSale: `${externalListings.bayutForSale}&category=apartment`, forRent: `${externalListings.bayutForRent}&category=apartment` },
  { label: "Villas", icon: Home, forSale: `${externalListings.bayutForSale}&category=villa`, forRent: `${externalListings.bayutForRent}&category=villa` },
  { label: "Townhouses", icon: Warehouse, forSale: `${externalListings.bayutForSale}&category=townhouse`, forRent: `${externalListings.bayutForRent}&category=townhouse` },
  { label: "Commercial", icon: Store, forSale: `${externalListings.bayutForSale}&category=commercial`, forRent: `${externalListings.bayutForRent}&category=commercial` },
];

export default function PropertyDiscovery() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-16 lg:px-8">
      <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div className="max-w-xl">
          <SectionHeading kicker="Live Inventory" title="Explore our current listings" />
          <Reveal delay={0.2}>
            <p className="mt-3 text-[15px] leading-relaxed text-brand-ink/60">
              Our full, always-current portfolio lives on Bayut, our verified listing partner. Pick a category, or open our agency profile.
            </p>
          </Reveal>
        </div>
        <Reveal delay={0.15}>
          <a
            href={externalListings.bayutCompanyForSale}
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center gap-2 whitespace-nowrap rounded-full border border-brand-gold/50 px-5 py-2.5 text-sm font-semibold text-heading transition-colors duration-300 hover:bg-brand-gold hover:text-brand-navy"
          >
            Agency profile
            <ArrowUpRight size={15} className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </a>
        </Reveal>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {categories.map((cat, i) => (
          <Reveal key={cat.label} delay={i * 0.07}>
            <div className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-brand-line bg-surface p-5 transition-all duration-300 hover:-translate-y-1 hover:border-brand-gold/50 hover:shadow-[0_18px_40px_-24px_rgba(219,204,59,0.6)]">
              <span aria-hidden="true" className="absolute inset-x-0 top-0 h-0.5 origin-left scale-x-0 bg-gradient-to-r from-brand-gold to-brand-gold-soft transition-transform duration-500 group-hover:scale-x-100" />
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 flex-none items-center justify-center rounded-full bg-brand-gold/15 text-brand-gold transition-colors duration-300 group-hover:bg-brand-gold group-hover:text-brand-navy">
                  <cat.icon size={18} strokeWidth={1.75} />
                </span>
                <h3 className="text-base font-semibold text-heading">{cat.label}</h3>
              </div>
              <div className="mt-5 grid grid-cols-2 gap-2 text-sm font-medium">
                <a
                  href={cat.forSale}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-1 rounded-full bg-brand-navy px-3 py-2 text-white transition-colors hover:bg-brand-navy-light dark:bg-white/10 dark:hover:bg-white/20"
                >
                  For sale <ArrowUpRight size={13} />
                </a>
                <a
                  href={cat.forRent}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-1 rounded-full border border-brand-line px-3 py-2 text-heading transition-colors hover:border-brand-gold hover:text-brand-gold"
                >
                  For rent <ArrowUpRight size={13} />
                </a>
              </div>
            </div>
          </Reveal>
        ))}
      </div>

      <div className="mt-5 flex flex-col gap-2 text-xs text-brand-ink/45 sm:flex-row sm:items-center sm:justify-between">
        <p>Links open Bayut in a new tab. Prices and availability are managed live there.</p>
        <Link prefetch={false} href="/for-sale" className="text-sm font-semibold text-heading hover:text-brand-gold">
          More about buying with Meteorite →
        </Link>
      </div>
    </section>
  );
}
