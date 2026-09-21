import type { Metadata } from "next";
import { ShieldCheck, Lock } from "lucide-react";
import { company, paymentTiers } from "@/lib/content";
import { getStatsList } from "@/lib/site-stats";
import StatCounter, { type StatIconKey } from "@/components/StatCounter";
import Reveal from "@/components/Reveal";
import AnimatedSecureLock from "@/components/AnimatedSecureLock";
import PaymentTierSelector from "@/components/PaymentTierSelector";

export const metadata: Metadata = { title: "Payment" };

const statIcons: StatIconKey[] = ["building", "users", "trophy", "smile"];

export default async function PaymentPage() {
  const stats = await getStatsList();

  return (
    <div className="relative overflow-hidden">
      <section className="relative overflow-hidden bg-brand-navy py-20 sm:py-24">
        <div className="glow-field" />
        <div className="grain-overlay" />
        <div className="relative mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <Reveal>
            <AnimatedSecureLock />
            <p className="mt-5 text-sm font-semibold uppercase tracking-[0.2em] text-brand-gold">
              Secure Payment
            </p>
            <h1 className="mt-3 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
              Please choose the amount
            </h1>
            <p className="mt-4 text-base leading-relaxed text-white/65">
              Complete your payment securely via Stripe. If you&apos;re unsure which amount
              applies to you, confirm with your agent first.
            </p>
          </Reveal>

          <PaymentTierSelector tiers={paymentTiers.map((t) => ({ amount: t.amount, url: t.url }))} />

          <Reveal delay={0.5}>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs font-medium text-white/45">
              <span className="inline-flex items-center gap-1.5">
                <Lock size={14} /> Processed securely by Stripe
              </span>
              <span className="inline-flex items-center gap-1.5">
                <ShieldCheck size={14} /> Broker Card #{company.brokerCard} · ORN {company.orn}
              </span>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
        <Reveal>
          <p className="text-center text-sm font-semibold uppercase tracking-[0.2em] text-brand-gold">
            Why clients trust us
          </p>
        </Reveal>
        <div className="mt-8 grid grid-cols-2 gap-5 lg:grid-cols-4">
          {stats.map((stat, i) => (
            <Reveal key={stat.label} delay={i * 0.08}>
              <div className="glass shimmer-border rounded-2xl px-4 py-8 text-center">
                <StatCounter value={stat.value} icon={statIcons[i % statIcons.length]} />
                <p className="mt-3 text-sm font-medium text-brand-ink/60">{stat.label}</p>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.2}>
          <p className="mt-10 text-center text-sm text-brand-ink/50">
            Questions about an invoice or a payment that didn&apos;t go through? Call{" "}
            <a href={`tel:${company.phoneE164}`} className="font-semibold text-heading hover:text-brand-gold">
              {company.phoneDisplay}
            </a>{" "}
            or email{" "}
            <a href={`mailto:${company.email}`} className="font-semibold text-heading hover:text-brand-gold">
              {company.email}
            </a>
            .
          </p>
        </Reveal>
      </section>
    </div>
  );
}
