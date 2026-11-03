import type { Metadata } from "next";
import { company } from "@/lib/content";
import ContactForm from "@/components/ContactForm";
import ContactHero, { type ContactAction } from "@/components/ContactHero";
import ContactAside from "@/components/ContactAside";
import Reveal from "@/components/Reveal";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Contact Us",
  description: `Contact ${company.name} in Jumeirah 1, Dubai — call ${company.phoneDisplay} or email ${company.email} to buy, sell, rent or manage property.`,
  path: "/contact-us",
});

const mapSrc = `https://www.google.com/maps?q=${encodeURIComponent(company.address)}&output=embed`;

const actions: ContactAction[] = [
  { key: "phone", label: "Call", value: company.phoneDisplay, href: `tel:${company.phoneE164}` },
  { key: "whatsapp", label: "WhatsApp", value: "Chat instantly", href: company.whatsappUrl, external: true },
  { key: "mail", label: "Email", value: company.email, href: `mailto:${company.email}` },
];

export default function ContactUsPage() {
  return (
    <div>
      <ContactHero actions={actions} />

      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-16 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr]">
          <Reveal>
            <div className="glass shimmer-border rounded-3xl p-7 sm:p-9">
              <h2 className="text-2xl font-semibold tracking-tight text-heading">Send us a message</h2>
              <p className="mb-6 mt-1.5 text-sm text-brand-ink/66">Tell us what you&apos;re looking for and we&apos;ll point you to the right person.</p>
              <ContactForm />
            </div>
          </Reveal>

          <ContactAside address={company.address} poBox={company.poBox} orn={company.orn} brokerCard={company.brokerCard} mapSrc={mapSrc} />
        </div>
      </section>
    </div>
  );
}
