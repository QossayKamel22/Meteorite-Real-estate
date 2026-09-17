import { stats } from "@/lib/content";
import StatCounter from "@/components/StatCounter";
import Reveal from "@/components/Reveal";

export default function StatsSection() {
  return (
    <section className="relative overflow-hidden border-y border-brand-line bg-brand-paper py-16">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-5 px-4 sm:px-6 lg:grid-cols-4 lg:px-8">
        {stats.map((stat, i) => (
          <Reveal key={stat.label} delay={i * 0.07}>
            <div className="glass shimmer-border rounded-2xl px-4 py-8 text-center">
              <StatCounter value={stat.value} />
              <p className="mt-2 text-sm font-medium text-brand-ink/60">{stat.label}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
