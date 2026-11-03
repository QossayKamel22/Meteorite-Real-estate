import type { Metadata } from "next";
import { Award, BadgeCheck, ShieldCheck } from "lucide-react";
import { company, credentials } from "@/lib/content";
import Reveal from "@/components/Reveal";
import SectionHeading from "@/components/SectionHeading";
import StatsSection from "@/components/StatsSection";
import { LeadershipSpread } from "@/components/CeoSection";
import AgentsSection from "@/components/AgentsSection";
import ContactCta from "@/components/ContactCta";
import RegistrationDetails from "@/components/RegistrationDetails";
import DevelopersAndCertificate from "@/components/DevelopersAndCertificate";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "About Us",
  description: company.legalTagline,
  path: "/about-us",
});

const credentialIcons = [ShieldCheck, Award, BadgeCheck];

export default async function AboutUsPage() {
  return (
    <div>
      <section className="relative overflow-hidden bg-brand-navy py-20 sm:py-28">
        <div className="glow-field" />
        <div className="grain-overlay" />
        <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <SectionHeading kicker="About Us" title={company.name} as="h1" align="center" theme="light" />
          <Reveal delay={0.25}>
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
                    className="glass glass-dark shimmer-border flex items-center gap-3 rounded-3xl p-5 text-left transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl"
                  >
                    <span className="flex h-10 w-10 flex-none items-center justify-center rounded-2xl bg-brand-gold/15 text-brand-gold ring-1 ring-brand-gold/20">
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

      <section className="mx-auto max-w-5xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <RegistrationDetails address={company.address} poBox={company.poBox} orn={company.orn} brokerCard={company.brokerCard} />
      </section>

      <DevelopersAndCertificate />

      <LeadershipSpread />
      <AgentsSection variant="about" />
      <ContactCta />
    </div>
  );
}
