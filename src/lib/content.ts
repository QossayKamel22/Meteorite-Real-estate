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
 * Real Estate Office Registration Certificate, issued by Dubai Land
 * Department / RERA, as displayed on meteoriterealestate.com/about-us/
 * ("OUR CERTIFICATE"). Trade name on the certificate is the LLC's legal
 * name, which differs slightly in formatting from the public brand name.
 */
export const certificate = {
  image: "/brand/certificate-rera.jpg",
  tradeName: "Meteorite Real Estate L.L.C",
  licenseNo: "916037",
  registrationDate: "10/11/2020",
  expiryDate: "9/11/2026",
  classification: "General Office Classification",
  activities: ["Leasing Property Brokerage Agents", "Real Estate Buying & Selling Brokerage"],
  issuer: "Dubai Land Department · RERA",
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

export const stats = [
  { value: 325, label: "Properties Submitted" },
  { value: 12, label: "Professional Agents" },
  { value: 195, label: "Success Stories" },
  { value: 250, label: "Happy Customers" },
];

export const testimonials = [
  {
    name: "Saif",
    role: "Customer",
    quote:
      "Saad is very professional, knowledgeable and helpful… i would highly recommend working with him.",
  },
  {
    name: "Issa Haddad",
    role: "Customer",
    quote: "Very Professional team with high expertise and ethics. All the Best Meteorite",
  },
  {
    name: "Ahmed Alsuwaidi",
    role: "Customer",
    quote:
      "I deal with this company this very professional so, they helped me to find the best option in the market specially saad. Thanks a lot Mr. Saad to find my dream home.",
  },
];

/**
 * Full agent roster as published on meteoriterealestate.com/agents/ (3 profiles
 * live on the site as of 2026-09-17). Note: the live site's agent-profile
 * template displays "CEO and Founder" above every agent's name, including
 * Hattab and Zamily — almost certainly an unedited CMS template default,
 * since the About page and company records identify Saad Abdullah Soboh
 * alone as CEO and Founder. We use the live site's own breadcrumb
 * category ("Agent") for the other two rather than repeat what reads as a
 * templating error.
 */
export const agents = [
  {
    name: "Saad Abdullah Soboh",
    title: "CEO and Founder",
    photo: "/brand/saad-abdullah-soboh.jpg",
    email: "s.soboh@meteoriterealestate.com",
    phone: "+971 50 110 2242",
    profileUrl: "https://meteoriterealestate.com/agents/saad-abdullah-soboh/",
  },
  {
    name: "Mohd Amin Mohammad Hattab",
    title: "Agent",
    photo: "/brand/agent-mohd-amin-hattab.png",
    email: "Mohd.Hattab@meteoriterealestate.com",
    phone: "+971 52 699 7631",
    profileUrl: "https://meteoriterealestate.com/agents/mohd-amin-mohammad-hattab/",
  },
  {
    name: "Meher Samir M Zamily",
    title: "Agent",
    photo: "/brand/agent-meher-samir.png",
    email: "info@meteoriterealestate.com",
    phone: "+971 50 659 9176",
    profileUrl: "https://meteoriterealestate.com/agents/meher-samir/",
  },
] as const;

export const ceo = {
  name: "Saad Abdullah Soboh",
  title: "CEO and Founder",
  photo: "/brand/saad-abdullah-soboh.jpg",
  bio: "Welcome to our boutique real estate firm, where our CEO and Founder personally oversee every aspect of our services. With a customer-focused approach, we take pride in delivering exceptional property management services for leasing and selling tailored solutions to your unique needs.",
  background:
    "Over 17 years in banking — mortgage, valuations, escrow law, business development, credit administration, and comprehensive business banking services — brought to Meteorite's real estate brokerage, leasing, sales, valuation and negotiation practice.",
  credentials: [
    `Broker Card #${company.brokerCard}`,
    `RERA ORN ${company.orn}`,
    "72 credit hours of real estate training across 9 courses",
  ],
  profileUrl: "https://meteoriterealestate.com/agents/saad-abdullah-soboh/",
};

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
