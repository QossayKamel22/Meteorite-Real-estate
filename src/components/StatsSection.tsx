import { getStatsList } from "@/lib/site-stats";
import StatCounter, { type StatIconKey } from "@/components/StatCounter";
import Reveal from "@/components/Reveal";
import SectionHeading from "@/components/SectionHeading";

const icons: StatIconKey[] = ["building", "users", "trophy", "smile"];

export default async function StatsSection() {
  const stats = await getStatsList();

  return (
    <section id="stats" className="relative overflow-hidden border-y border-brand-line bg-brand-paper py-20">
      <div className="pointer-events-none absolute left-1/2 top-0 h-px w-2/3 -translate-x-1/2 bg-gradient-to-r from-transparent via-brand-gold/50 to-transparent" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          kicker="Track Record"
          title="Numbers built over 20 years"
          align="center"
        />

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
