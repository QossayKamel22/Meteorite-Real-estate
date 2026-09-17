import type { Metadata } from "next";
import { company } from "@/lib/content";
import ContactForm from "@/components/ContactForm";

export const metadata: Metadata = {
  title: "Contact Us",
  description: `Contact ${company.name} — ${company.phoneDisplay}, ${company.email}`,
};

export default function ContactUsPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:px-8">
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-gold">
        Contact Us
      </p>
      <h1 className="mt-3 text-4xl font-semibold tracking-tight text-heading sm:text-5xl">
        We&apos;d love to hear from you
      </h1>

      <div className="mt-12 grid gap-12 lg:grid-cols-2">
        <div>
          <ContactForm />
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl border border-brand-line p-6">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-brand-ink/50">
              Office
            </h2>
            <p className="mt-2 text-[15px] leading-relaxed text-brand-ink/80">{company.address}</p>
            <p className="mt-1 text-[15px] text-brand-ink/60">P.O. Box: {company.poBox}</p>
          </div>

          <div className="rounded-2xl border border-brand-line p-6">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-brand-ink/50">
              Direct
            </h2>
            <a href={`tel:${company.phoneE164}`} className="mt-2 block text-[15px] font-medium text-heading hover:text-brand-gold">
              {company.phoneDisplay}
            </a>
            <a href={`mailto:${company.email}`} className="mt-1 block text-[15px] font-medium text-heading hover:text-brand-gold">
              {company.email}
            </a>
            <a
              href={company.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1 block text-[15px] font-medium text-heading hover:text-brand-gold"
            >
              WhatsApp
            </a>
          </div>

          <div className="rounded-2xl border border-brand-line p-6">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-brand-ink/50">
              Registration
            </h2>
            <p className="mt-2 text-[15px] text-brand-ink/70">RERA ORN {company.orn}</p>
            <p className="text-[15px] text-brand-ink/70">Broker Card #{company.brokerCard}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
