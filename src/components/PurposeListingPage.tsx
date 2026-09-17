import { externalListings } from "@/lib/content";

const categoryLabels = ["Apartment", "Villa", "Townhouse", "Commercial"];

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
    <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:px-8">
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-gold">
        {isForSale ? "For Sale" : "For Rent"}
      </p>
      <h1 className="mt-3 text-4xl font-semibold tracking-tight text-heading sm:text-5xl">
        Properties {isForSale ? "for sale" : "for rent"}
      </h1>
      <p className="mt-4 max-w-2xl text-lg leading-relaxed text-brand-ink/70">
        Our live, continuously-updated portfolio of {isForSale ? "sale" : "rental"} listings is
        hosted on Bayut, our verified listing partner, so you always see current pricing and
        availability.
      </p>

      <a
        href={companyUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-6 inline-flex rounded-full bg-brand-navy px-7 py-3.5 text-[15px] font-semibold text-white transition-colors hover:bg-brand-navy-light"
      >
        View all {isForSale ? "sale" : "rental"} listings on Bayut
      </a>

      <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {categoryLabels.map((label) => (
          <a
            key={label}
            href={`${baseUrl}&category=${label.toLowerCase()}`}
            target="_blank"
            rel="noopener noreferrer"
            className="group rounded-2xl border border-brand-line bg-surface p-6 transition-shadow hover:shadow-md"
          >
            <h2 className="text-lg font-semibold text-heading">{label}s</h2>
            <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-brand-ink/60 group-hover:text-brand-gold">
              Browse listings <span aria-hidden="true">→</span>
            </span>
          </a>
        ))}
      </div>

      <p className="mt-8 text-xs text-brand-ink/45">
        We link directly to our official Bayut portfolio rather than duplicating prices and
        availability here, so the information you see is always accurate.
      </p>
    </div>
  );
}
