import { stats } from "@/lib/content";
import StatCounter, { type StatIconKey } from "@/components/StatCounter";
import Reveal from "@/components/Reveal";

const icons: StatIconKey[] = ["building", "users", "trophy", "smile"];

export default function StatsSection() {
  return (
    <section id="stats" className="relative overflow-hidden border-y border-brand-line bg-brand-paper py-20">
      <div className="pointer-events-none absolute left-1/2 top-0 h-px w-2/3 -translate-x-1/2 bg-gradient-to-r from-transparent via-brand-gold/50 to-transparent" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal>
          <p className="text-center text-sm font-semibold uppercase tracking-[0.2em] text-brand-gold">
            Track Record
          </p>
          <h2 className="mt-3 text-center text-3xl font-semibold tracking-tight text-heading sm:text-4xl">
            Numbers built over 20 years
          </h2>
        </Reveal>

        <div className="mt-12 grid grid-cols-2 gap-5 lg:grid-cols-4">
          {stats.map((stat, i) => (
            <Reveal key={stat.label} delay={i * 0.08}>
              <div className="glass shimmer-border group relative overflow-hidden rounded-2xl px-4 py-9 text-center transition-transform duration-300 hover:-translate-y-1.5">
                <StatCounter value={stat.value} icon={icons[i % icons.length]} />
                <p className="mt-3 text-sm font-medium text-brand-ink/60">{stat.label}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
