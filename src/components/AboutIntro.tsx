import Link from "next/link";
import { ShieldCheck, Award, BadgeCheck } from "lucide-react";
import { company, credentials } from "@/lib/content";
import Reveal from "@/components/Reveal";
import SectionHeading from "@/components/SectionHeading";

const credentialIcons = [ShieldCheck, Award, BadgeCheck];

export default function AboutIntro() {
  return (
    <section className="bg-brand-paper">
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div>
            <SectionHeading kicker={`About ${company.name}`} title="A RERA-certified brokerage, trusted since 2005" />
            <Reveal delay={0.2}>
              <p className="mt-5 max-w-2xl text-lg leading-relaxed text-brand-ink/70">
                {company.legalTagline}
              </p>
              <Link prefetch={false}
                href="/about-us"
                className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-heading hover:text-brand-gold"
              >
                Read our full story
                <span aria-hidden="true">→</span>
              </Link>
            </Reveal>
          </div>

          <div role="list" className="space-y-4">
            {credentials.map((item, i) => {
              const Icon = credentialIcons[i % credentialIcons.length];
              return (
                <Reveal key={item} delay={i * 0.08}>
                  <div role="listitem" className="glass shimmer-border flex items-center gap-4 rounded-2xl p-5">
                    <span className="flex h-10 w-10 flex-none items-center justify-center rounded-full bg-brand-gold/15 text-brand-gold">
                      <Icon size={18} strokeWidth={1.75} />
                    </span>
                    <span className="text-[15px] leading-relaxed text-brand-ink/75">{item}</span>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
