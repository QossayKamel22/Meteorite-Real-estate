import type { Metadata } from "next";
import { Mail, MapPin, MessageCircle, Phone, ShieldCheck } from "lucide-react";
import { company } from "@/lib/content";
import ContactForm from "@/components/ContactForm";
import Reveal from "@/components/Reveal";

export const metadata: Metadata = {
  title: "Contact Us",
  description: `Contact ${company.name} — ${company.phoneDisplay}, ${company.email}`,
};

const mapSrc = `https://www.google.com/maps?q=${encodeURIComponent(company.address)}&output=embed`;

const quickActions = [
  { label: "Call", value: company.phoneDisplay, href: `tel:${company.phoneE164}`, icon: Phone },
  { label: "WhatsApp", value: "Chat instantly", href: company.whatsappUrl, icon: MessageCircle, external: true },
  { label: "Email", value: company.email, href: `mailto:${company.email}`, icon: Mail },
];

export default function ContactUsPage() {
  return (
    <div>
      <section className="relative overflow-hidden bg-brand-navy py-20 sm:py-24">
        <div className="glow-field" />
        <div className="grain-overlay" />
        <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <Reveal>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-gold">
              Contact Us
            </p>
            <h1 className="mt-3 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
              We&apos;d love to hear from you
            </h1>
            <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-white/65">
              Reach our team directly, or send a message below and we&apos;ll get back to you.
            </p>
          </Reveal>

          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            {quickActions.map((action, i) => (
              <Reveal key={action.label} delay={i * 0.08}>
                <a
                  href={action.href}
                  target={action.external ? "_blank" : undefined}
                  rel={action.external ? "noopener noreferrer" : undefined}
                  className="glass glass-dark shimmer-border group flex flex-col items-center gap-2 rounded-2xl p-6 transition-transform duration-300 hover:-translate-y-1.5"
                >
                  <span className="flex h-11 w-11 items-center justify-center rounded-full bg-brand-gold/15 text-brand-gold">
                    <action.icon size={20} strokeWidth={1.75} />
                  </span>
                  <p className="text-sm font-semibold text-white">{action.label}</p>
                  <p className="text-xs text-white/55">{action.value}</p>
                </a>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-2">
          <Reveal>
            <div className="glass shimmer-border rounded-3xl p-7 sm:p-9">
              <ContactForm />
            </div>
          </Reveal>

          <div className="space-y-6">
            <Reveal delay={0.08}>
              <div className="overflow-hidden rounded-3xl border border-brand-line">
                <iframe
                  src={mapSrc}
                  title="Meteorite Real Estate office location"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="h-56 w-full grayscale-[15%]"
                />
                <div className="flex items-start gap-3 bg-brand-paper p-5">
                  <MapPin size={18} className="mt-0.5 flex-none text-brand-gold" />
                  <div>
                    <p className="text-sm font-medium text-brand-ink/80">{company.address}</p>
                    <p className="mt-1 text-xs text-brand-ink/50">P.O. Box: {company.poBox}</p>
                  </div>
                </div>
              </div>
            </Reveal>

            <Reveal delay={0.16}>
              <div className="glass shimmer-border flex items-center gap-3 rounded-2xl p-5">
                <span className="flex h-10 w-10 flex-none items-center justify-center rounded-full bg-brand-gold/15 text-brand-gold">
                  <ShieldCheck size={18} strokeWidth={1.75} />
                </span>
                <p className="text-sm text-brand-ink/70">
                  RERA ORN {company.orn} · Broker Card #{company.brokerCard}
                </p>
              </div>
            </Reveal>
          </div>
        </div>
      </section>
    </div>
  );
}
