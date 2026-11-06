import { externalListings, credentials } from "@/lib/content";
import { getProperties, type Purpose } from "@/lib/properties-data";
import PageHero from "@/components/PageHero";
import ListingsBrowser from "@/components/ListingsBrowser";
import FaqSection from "@/components/FaqSection";
import { RENT_FAQ, SALE_FAQ } from "@/lib/faq";
import BayutBanner from "@/components/BayutBanner";

export default async function PurposeListingPage({ purpose }: { purpose: "for-sale" | "for-rent" }) {
  const isForSale = purpose === "for-sale";
  const dataPurpose: Purpose = isForSale ? "sale" : "rent";
  const properties = await getProperties({ purpose: dataPurpose });
  const companyUrl = isForSale ? externalListings.bayutCompanyForSale : externalListings.bayutCompanyForRent;

  return (
    <div>
      <PageHero
        image={isForSale ? "/brand/hero/dubai-night-skyline.jpg" : "/brand/hero/dubai-marina-night.jpg"}
        kicker={isForSale ? "For Sale" : "For Rent"}
        title={`Properties ${isForSale ? "for sale" : "for rent"}`}
        text={
          properties.length > 0
            ? `${properties.length} current ${isForSale ? "sale" : "rental"} listing${properties.length === 1 ? "" : "s"} from our own portfolio — and our full, continuously-updated inventory on Bayut below.`
            : `Our current ${isForSale ? "sale" : "rental"} listings. For our full, continuously-updated inventory, see our Bayut portfolio below.`
        }
        chips={[
          ...(properties.length > 0 ? [{ label: properties.length === 1 ? "listing" : "listings", value: properties.length }] : []),
          { label: "RERA-licensed brokerage" },
          { label: "Live inventory on Bayut" },
        ]}
      />

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <ListingsBrowser
          properties={properties}
          emptyText={`No ${isForSale ? "sale" : "rental"} listings published right now — check our full portfolio on Bayut below, or contact us directly.`}
        />
        <BayutBanner href={companyUrl} forSale={isForSale} credentials={[...credentials]} />
        <FaqSection title={isForSale ? "Buying in Dubai: good to know" : "Renting in Dubai: good to know"} items={isForSale ? SALE_FAQ : RENT_FAQ} />
      </section>
    </div>
  );
}
