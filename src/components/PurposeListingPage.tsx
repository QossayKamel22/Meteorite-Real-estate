import { Building2, Home, ShieldCheck, Store, Warehouse } from "lucide-react";
import { externalListings, credentials } from "@/lib/content";
import Reveal from "@/components/Reveal";

const categories = [
  { label: "Apartment", icon: Building2 },
  { label: "Villa", icon: Home },
  { label: "Townhouse", icon: Warehouse },
  { label: "Commercial", icon: Store },
];

export default function PurposeListingPage({
  purpose,
}: {
  purpose: "for-sale" | "for-rent";
}) {
  const isForSale = purpose === "for-sale";
  const baseUrl = isForSale ? externalListings.bayutForSale : externalListings.bayutForRent;
  const companyUrl = isForSale
    ? externalListings.bayutCompanyForSale
    : externalListings.bayutCompanyForRent;

  return (
    <div>
      <section className="relative overflow-hidden bg-brand-navy py-20 sm:py-24">
        <div className="glow-field" />
        <div className="grain-overlay" />
        <div className="relative mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <Reveal>
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-gold/15 text-brand-gold">
              {isForSale ? <Building2 size={26} strokeWidth={1.75} /> : <Home size={26} strokeWidth={1.75} />}
            </div>
            <p className="mt-5 text-sm font-semibold uppercase tracking-[0.2em] text-brand-gold">
              {isForSale ? "For Sale" : "For Rent"}
            </p>
            <h1 className="mt-3 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
              Properties {isForSale ? "for sale" : "for rent"}
            </h1>
            <p className="mt-4 text-base leading-relaxed text-white/65">
              Our live, continuously-updated portfolio of {isForSale ? "sale" : "rental"} listings
              is hosted on Bayut, our verified listing partner, so you always see current pricing
              and availability.
            </p>
            <a
              href={companyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-7 inline-flex rounded-full bg-brand-gold px-7 py-3.5 text-[15px] font-semibold text-brand-navy shadow-[0_8px_24px_-8px_rgba(219,204,59,0.6)] transition-transform duration-200 hover:scale-[1.03]"
            >
              View all {isForSale ? "sale" : "rental"} listings on Bayut
            </a>
          </Reveal>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map((cat, i) => (
            <Reveal key={cat.label} delay={i * 0.08}>
              <a
                href={`${baseUrl}&category=${cat.label.toLowerCase()}`}
                target="_blank"
                rel="noopener noreferrer"
                className="glass shimmer-border group flex h-full flex-col justify-between rounded-2xl p-6 transition-transform duration-300 hover:-translate-y-1.5"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-brand-gold/15 text-brand-gold">
                  <cat.icon size={20} strokeWidth={1.75} />
                </div>
                <h2 className="mt-4 text-lg font-semibold text-heading">{cat.label}s</h2>
                <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-brand-ink/60 group-hover:text-brand-gold">
                  Browse listings <span aria-hidden="true">→</span>
                </span>
              </a>
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.24}>
          <div className="mt-10 grid gap-4 rounded-2xl border border-brand-line bg-brand-paper p-6 sm:grid-cols-3">
            {credentials.map((item) => (
              <div key={item} className="flex items-center gap-3">
                <ShieldCheck size={16} className="flex-none text-brand-gold" />
                <span className="text-sm text-brand-ink/70">{item}</span>
              </div>
            ))}
          </div>
        </Reveal>

        <Reveal delay={0.3}>
          <p className="mt-6 text-xs text-brand-ink/45">
            We link directly to our official Bayut portfolio rather than duplicating prices and
            availability here, so the information you see is always accurate.
          </p>
        </Reveal>
      </section>
    </div>
  );
}
