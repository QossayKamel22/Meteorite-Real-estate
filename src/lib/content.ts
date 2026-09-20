/**
 * Verified content sourced directly from the live Meteorite Real Estate
 * website (meteoriterealestate.com) as of 2026-09-17. Do not invent or
 * alter facts here — every field must trace back to the live site.
 */

export const company = {
  name: "Meteorite Real Estate",
  legalTagline:
    "Performing professional brokerage in the UAE since 2005 in buying, selling, leasing, mortgages, escrow account consulting & property management services.",
  orn: "25323",
  brokerCard: "46946",
  poBox: "9897 DXB - UAE",
  address:
    "Office No.16-301, Golden Gate Offices, Al Hudaiba Awards Building – Block C, 2nd December Street, Jumeirah 1 – Dubai",
  phoneDisplay: "+971 50 110 2242",
  phoneE164: "+971501102242",
  email: "info@meteoriterealestate.com",
  whatsappUrl: "https://wa.me/+971501102242",
  copyrightNotice: "© 2020 Meteoriterealestate. All Rights Reserved.",
};

/**
 * Developer partner logos as shown under "REGISTERED WITH FOLLOWING
 * DEVELOPERS" on the origin About Us page. Individual logos were cropped
 * from that same source image (developer-partners.png) — same real
 * partnerships, isolated per-logo for a cleaner marquee presentation.
 */
export const developerPartners = [
  { name: "Binghatti", logo: "/brand/developers/binghatti.png" },
  { name: "Nakheel", logo: "/brand/developers/nakheel.png" },
  { name: "Dubai Properties", logo: "/brand/developers/dubai-properties.png" },
  { name: "Sobha Realty", logo: "/brand/developers/sobha.png" },
  { name: "Dubai Holding", logo: "/brand/developers/dubai-holding.png" },
  { name: "Majid Al Futtaim", logo: "/brand/developers/majid-al-futtaim.png" },
  { name: "Al-Futtaim", logo: "/brand/developers/al-futtaim.png" },
  { name: "The Sustainable City", logo: "/brand/developers/sustainable-city.png" },
  { name: "Emaar", logo: "/brand/developers/emaar.png" },
] as const;

export const socialLinks = {
  facebook: "https://www.facebook.com/MeteoriteRE",
  twitter: "https://twitter.com/MeteoriteRE",
  instagram: "https://www.instagram.com/meteorite.real.estate.dubai/",
};

export const externalListings = {
  bayutCompanyForSale:
    "https://www.bayut.com/companies/meteorite-real-estate-10128/?purpose=for-sale",
  bayutCompanyForRent:
    "https://www.bayut.com/companies/meteorite-real-estate-10128/?purpose=to-rent&rent_frequency=any",
  bayutForSale: "https://www.bayut.com/for-sale/property/uae/?agent_id=10128",
  bayutForRent: "https://www.bayut.com/to-rent/property/uae/?agent_id=10128",
};

export const navLinks = [
  { label: "Home", href: "/" },
  { label: "About Us", href: "/about-us" },
  { label: "For Sale", href: "/for-sale" },
  { label: "For Rent", href: "/for-rent" },
  { label: "Media", href: "/media" },
  { label: "Payment", href: "/payment" },
  { label: "Contact Us", href: "/contact-us" },
];

/**
 * Original values as scraped from the live site. These are no longer
 * read directly by the UI — the live, admin-editable numbers come from
 * src/lib/site-stats.ts (backed by Firestore). Kept here as the
 * documented source-of-truth for what the numbers originally were.
 */
export const stats = [
  { value: 325, label: "Properties Submitted" },
  { value: 12, label: "Professional Agents" },
  { value: 195, label: "Success Stories" },
  { value: 250, label: "Happy Customers" },
];

// Testimonials moved to src/lib/testimonials-data.ts (Firestore-backed,
// admin-editable). See SEED_TESTIMONIALS there for the original verified values.

// Agent roster and CEO bio moved to src/lib/agents-data.ts (Firestore-backed,
// admin-editable). See SEED_AGENTS there for the original verified values.

export const credentials = [
  "RERA & Dubai Land Department certified brokerage",
  "CPM, CRB, CRV, UREP, CBSL certified professionals",
  `Broker Card #${company.brokerCard} · ORN ${company.orn}`,
];

/**
 * Live Stripe payment links from meteoriterealestate.com/payment ("Please
 * choose the Amount"). The origin page shows only these three fixed AED
 * tiers with no labels distinguishing what each is for — we preserve that
 * exactly rather than inventing purposes (e.g. "booking fee") for them.
 */
export const paymentTiers = [
  { amount: 5250, url: "https://buy.stripe.com/aEU6qg4Sf1qWcAU3ce" },
  { amount: 7350, url: "https://buy.stripe.com/cN201S84r0mSeJ29AD" },
  { amount: 10500, url: "https://buy.stripe.com/00g3e4aczd9EgRabIM" },
] as const;

export const propertyCategories = [
  { label: "Apartments & Studios", forSaleQuery: "type=Apartment", image: "/brand/hero-dubai-skyline.jpg" },
  { label: "Villas", forSaleQuery: "type=Villa" },
  { label: "Townhouses", forSaleQuery: "type=Townhouse" },
  { label: "Commercial", forSaleQuery: "type=Commercial" },
] as const;
