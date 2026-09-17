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

export const propertyCategories = [
  { label: "Apartments & Studios", forSaleQuery: "type=Apartment", image: "/brand/hero-dubai-skyline.jpg" },
  { label: "Villas", forSaleQuery: "type=Villa" },
  { label: "Townhouses", forSaleQuery: "type=Townhouse" },
  { label: "Commercial", forSaleQuery: "type=Commercial" },
] as const;
