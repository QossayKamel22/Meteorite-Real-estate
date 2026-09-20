import { Building2, Home, ShieldCheck } from "lucide-react";
import { externalListings, credentials } from "@/lib/content";
import { getProperties, type Purpose } from "@/lib/properties-data";
import Reveal from "@/components/Reveal";
import PropertyCard from "@/components/PropertyCard";

export default async function PurposeListingPage({
  purpose,
}: {
  purpose: "for-sale" | "for-rent";
}) {
  const isForSale = purpose === "for-sale";
  const dataPurpose: Purpose = isForSale ? "sale" : "rent";
  const properties = await getProperties({ purpose: dataPurpose });
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
              {properties.length > 0
                ? `${properties.length} current ${isForSale ? "sale" : "rental"} listing${properties.length === 1 ? "" : "s"} from our own portfolio.`
                : `Our current ${isForSale ? "sale" : "rental"} listings.`}{" "}
              For our full, continuously-updated inventory, see our Bayut portfolio below.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        {properties.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {properties.map((property, i) => (
              <PropertyCard key={property.id} property={property} delay={i * 0.06} />
            ))}
          </div>
        ) : (
          <Reveal>
            <p className="rounded-2xl border border-dashed border-brand-line p-10 text-center text-sm text-brand-ink/55">
              No {isForSale ? "sale" : "rental"} listings published right now — check our full
              portfolio on Bayut below, or contact us directly.
            </p>
          </Reveal>
        )}

        <Reveal delay={0.1}>
          <div className="mt-10 flex flex-col items-center gap-4 rounded-2xl border border-brand-line bg-brand-paper p-8 text-center sm:flex-row sm:justify-between sm:text-left">
            <p className="text-sm text-brand-ink/70">
              Looking for more options? Browse our complete, live inventory on Bayut, our verified
              listing partner.
            </p>
            <a
              href={companyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="whitespace-nowrap rounded-full bg-brand-gold px-6 py-3 text-sm font-semibold text-brand-navy shadow-[0_8px_24px_-8px_rgba(219,204,59,0.6)] transition-transform duration-200 hover:scale-[1.03]"
            >
              View all on Bayut
            </a>
          </div>
        </Reveal>

        <Reveal delay={0.16}>
          <div className="mt-6 grid grid-cols-1 gap-4 rounded-2xl border border-brand-line bg-brand-paper p-6 sm:grid-cols-3">
            {credentials.map((item) => (
              <div key={item} className="flex items-center gap-3">
                <ShieldCheck size={16} className="flex-none text-brand-gold" />
                <span className="text-sm text-brand-ink/70">{item}</span>
              </div>
            ))}
          </div>
        </Reveal>
      </section>
    </div>
  );
}
