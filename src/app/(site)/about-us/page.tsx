import type { Metadata } from "next";
import { Award, BadgeCheck, MapPin, ShieldCheck } from "lucide-react";
import { company, credentials } from "@/lib/content";
import { getTestimonials } from "@/lib/testimonials-data";
import Reveal from "@/components/Reveal";
import StatsSection from "@/components/StatsSection";
import CeoSection from "@/components/CeoSection";
import AgentsSection from "@/components/AgentsSection";
import TestimonialsSection from "@/components/TestimonialsSection";
import ContactCta from "@/components/ContactCta";
import DevelopersAndCertificate from "@/components/DevelopersAndCertificate";

export const metadata: Metadata = {
  title: "About Us",
  description: company.legalTagline,
};

const credentialIcons = [ShieldCheck, Award, BadgeCheck];

export default async function AboutUsPage() {
  const testimonials = await getTestimonials();
  return (
    <div>
      <section className="relative overflow-hidden bg-brand-navy py-20 sm:py-28">
        <div className="glow-field" />
        <div className="grain-overlay" />
        <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <Reveal>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-gold">
              About Us
            </p>
            <h1 className="mt-3 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
              {company.name}
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-white/70">
              {company.legalTagline}
            </p>
          </Reveal>

          <Reveal delay={0.15}>
            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              {credentials.map((item, i) => {
                const Icon = credentialIcons[i % credentialIcons.length];
                return (
                  <div
                    key={item}
                    className="glass glass-dark shimmer-border flex items-center gap-3 rounded-2xl p-5 text-left"
                  >
                    <span className="flex h-9 w-9 flex-none items-center justify-center rounded-full bg-brand-gold/15 text-brand-gold">
                      <Icon size={16} strokeWidth={1.75} />
                    </span>
                    <span className="text-sm leading-relaxed text-white/80">{item}</span>
                  </div>
                );
              })}
            </div>
          </Reveal>
        </div>
      </section>

      <StatsSection />

      <section className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
        <Reveal>
          <div className="glass shimmer-border rounded-3xl p-8 sm:p-10">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-gold/15 text-brand-gold">
                <MapPin size={18} strokeWidth={1.75} />
              </span>
              <h2 className="text-lg font-semibold text-heading">Registration Details</h2>
            </div>
            <dl className="mt-6 grid gap-6 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-brand-ink/50">Office Address</dt>
                <dd className="mt-1 text-brand-ink/80">{company.address}</dd>
              </div>
              <div>
                <dt className="text-brand-ink/50">P.O. Box</dt>
                <dd className="mt-1 text-brand-ink/80">{company.poBox}</dd>
              </div>
              <div>
                <dt className="text-brand-ink/50">RERA ORN</dt>
                <dd className="mt-1 text-brand-ink/80">{company.orn}</dd>
              </div>
              <div>
                <dt className="text-brand-ink/50">Broker Card</dt>
                <dd className="mt-1 text-brand-ink/80">#{company.brokerCard}</dd>
              </div>
            </dl>
          </div>
        </Reveal>
      </section>

      <DevelopersAndCertificate />

      <CeoSection />
      <AgentsSection variant="about" />
      <TestimonialsSection testimonials={testimonials} />
      <ContactCta />
    </div>
  );
}
