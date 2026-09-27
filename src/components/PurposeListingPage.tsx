import { ArrowUpRight, Building2, Home, ShieldCheck } from "lucide-react";
import { externalListings, credentials } from "@/lib/content";
import { getProperties, type Purpose } from "@/lib/properties-data";
import Reveal from "@/components/Reveal";
import PropertyCard from "@/components/PropertyCard";
import SectionHeading from "@/components/SectionHeading";

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
          </Reveal>
          <SectionHeading
            kicker={isForSale ? "For Sale" : "For Rent"}
            title={`Properties ${isForSale ? "for sale" : "for rent"}`}
            as="h1"
            align="center"
            theme="light"
            className="mt-5"
          />
          <Reveal delay={0.25}>
            <p className="mt-4 text-base leading-relaxed text-white/65">
              {properties.length > 0
                ? `${properties.length} current ${isForSale ? "sale" : "rental"} listing${properties.length === 1 ? "" : "s"} from our own portfolio.`
                : `Our current ${isForSale ? "sale" : "rental"} listings.`}{" "}
              For our full, continuously-updated inventory, see our Bayut portfolio below.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:py-20 sm:px-6 lg:px-8">
        {properties.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {properties.map((property, i) => (
              <PropertyCard key={property.id} property={property} delay={i * 0.06} />
            ))}
          </div>
        ) : (
          <Reveal>
            <p className="rounded-3xl border border-dashed border-brand-line p-10 text-center text-sm text-brand-ink/55">
              No {isForSale ? "sale" : "rental"} listings published right now — check our full
              portfolio on Bayut below, or contact us directly.
            </p>
          </Reveal>
        )}

        <Reveal delay={0.1}>
          <a
            href={companyUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="glass shimmer-border group mt-10 flex flex-col items-center gap-5 rounded-3xl p-8 text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl sm:flex-row sm:justify-between sm:text-left"
          >
            <div className="flex items-center gap-4">
              <span className="flex h-12 w-12 flex-none items-center justify-center rounded-2xl bg-brand-gold/15 text-brand-gold ring-1 ring-brand-gold/20">
                {isForSale ? <Building2 size={20} strokeWidth={1.75} /> : <Home size={20} strokeWidth={1.75} />}
              </span>
              <p className="text-sm text-brand-ink/70">
                Looking for more options? Browse our complete, live inventory on Bayut, our verified
                listing partner.
              </p>
            </div>
            <span className="inline-flex flex-none items-center gap-1.5 whitespace-nowrap rounded-full bg-brand-gold px-6 py-3 text-sm font-semibold text-brand-navy shadow-[0_8px_24px_-8px_rgba(219,204,59,0.6)] transition-transform duration-200 group-hover:scale-[1.03]">
              View all on Bayut
              <ArrowUpRight size={15} className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </span>
          </a>
        </Reveal>

        <Reveal delay={0.16}>
          <div className="glass shimmer-border mt-6 grid grid-cols-1 gap-4 rounded-3xl p-6 sm:grid-cols-3">
            {credentials.map((item) => (
              <div key={item} className="flex items-center gap-3">
                <span className="flex h-8 w-8 flex-none items-center justify-center rounded-full bg-brand-gold/15 text-brand-gold">
                  <ShieldCheck size={14} />
                </span>
                <span className="text-sm text-brand-ink/70">{item}</span>
              </div>
            ))}
          </div>
        </Reveal>
      </section>
    </div>
  );
}
