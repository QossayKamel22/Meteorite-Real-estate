export type Faq = { q: string; a: string };

/** General, widely-known points for people thinking of buying or renting in Dubai. Anything that depends on a specific property, price or date is answered by the team. */
export const SALE_FAQ: Faq[] = [
  { q: "Can foreigners buy property in Dubai?", a: "Yes. Non-residents and residents can buy freehold property in the areas the government has designated for foreign ownership. Our team will tell you whether a particular community qualifies." },
  { q: "What costs come on top of the price?", a: "Mainly the Dubai Land Department transfer fee (4% of the property value), the registration and administration fees, and the broker's commission. If you use a mortgage there are also valuation and bank fees. Ask us for a full breakdown on any property." },
  { q: "Can I buy off-plan, and is it safe?", a: "Yes. Off-plan purchases are usually paid in instalments against a payment plan, and developers must hold buyers' payments in a regulated escrow account. We only present projects from registered developers." },
  { q: "Do I need a mortgage pre-approval?", a: "Not required, but it helps. A pre-approval tells you your real budget and speeds up the purchase once you have chosen. We can introduce you to banks and mortgage advisers." },
  { q: "How long does a purchase take?", a: "It depends on the property and whether it is financed. Cash purchases of ready properties can move quickly; mortgages and off-plan registrations take longer. We will give you a realistic timeline for your case." },
];

export const RENT_FAQ: Faq[] = [
  { q: "What do I need to rent a property?", a: "Usually a copy of your passport and Emirates ID (or visa), and a security deposit. The landlord or agent will confirm exactly what is needed for the property you choose." },
  { q: "What is Ejari?", a: "Ejari is Dubai's system for registering tenancy contracts. A registered contract is needed for many services, such as connecting utilities. We help with the registration." },
  { q: "How is rent usually paid?", a: "Rent in Dubai is commonly paid yearly, often arranged as one payment or several post-dated cheques. Some landlords offer monthly payment; each listing shows its terms." },
  { q: "Can I negotiate the rent?", a: "Often yes, depending on the property, the season and the length of the contract. Tell us your budget and we will say what is realistic." },
  { q: "Who pays the agency fee?", a: "This depends on the arrangement for each property. We state it clearly before you commit, so there are no surprises." },
];

export const CONTACT_FAQ: Faq[] = [
  { q: "How quickly will you reply?", a: "We aim to reply the same working day. For something urgent, WhatsApp or a call is the fastest way to reach us." },
  { q: "Can you help me list my property?", a: "Yes. Choose \"List my property\" in the form or call us, and an agent will arrange a visit to value and photograph it." },
  { q: "Do you manage rented properties?", a: "Yes, property management is part of our service. Tell us what you need and we will explain how it works." },
  { q: "Are you a licensed brokerage?", a: "Yes. Meteorite Real Estate is registered with the Dubai Land Department and RERA; our registration details are on the About Us page." },
];
