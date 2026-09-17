import Link from "next/link";
import { company, credentials } from "@/lib/content";
import Reveal from "@/components/Reveal";

export default function AboutIntro() {
  return (
    <section className="bg-brand-paper">
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <Reveal>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-gold">
              About {company.name}
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-brand-navy sm:text-4xl">
              A RERA-certified brokerage, trusted since 2005
            </h2>
            <p className="mt-5 max-w-2xl text-lg leading-relaxed text-brand-ink/70">
              {company.legalTagline}
            </p>
            <Link
              href="/about-us"
              className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-navy hover:text-brand-gold"
            >
              Read our full story
              <span aria-hidden="true">→</span>
            </Link>
          </Reveal>

          <div role="list" className="space-y-4">
            {credentials.map((item, i) => (
              <Reveal key={item} delay={i * 0.08}>
                <div role="listitem" className="glass shimmer-border flex items-start gap-3 rounded-2xl p-5">
                  <span
                    className="mt-1 h-2 w-2 flex-none rounded-full bg-brand-gold"
                    aria-hidden="true"
                  />
                  <span className="text-[15px] leading-relaxed text-brand-ink/75">{item}</span>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
