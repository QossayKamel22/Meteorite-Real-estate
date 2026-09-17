import { stats } from "@/lib/content";
import StatCounter from "@/components/StatCounter";

export default function StatsSection() {
  return (
    <section className="border-y border-brand-line bg-brand-paper">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-8 px-4 py-14 sm:px-6 lg:grid-cols-4 lg:px-8">
        {stats.map((stat) => (
          <div key={stat.label} className="text-center">
            <StatCounter value={stat.value} />
            <p className="mt-2 text-sm font-medium text-brand-ink/60">{stat.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
