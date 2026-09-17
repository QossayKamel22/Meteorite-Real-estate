import Image from "next/image";
import { agents } from "@/lib/content";
import Reveal from "@/components/Reveal";

export default function AgentsSection() {
  return (
    <section className="relative overflow-hidden bg-brand-navy py-20">
      <div className="glow-field" />
      <div className="grain-overlay" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-gold">
            Our Team
          </p>
          <h2 className="mt-3 max-w-xl text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            Meet the agents behind Meteorite
          </h2>
        </Reveal>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {agents.map((agent, i) => (
            <Reveal key={agent.name} delay={i * 0.08}>
              <a
                href={agent.profileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="glass glass-dark shimmer-border group flex flex-col items-center rounded-3xl p-8 text-center transition-transform duration-300 hover:-translate-y-1.5"
              >
                <div className="relative h-28 w-28 overflow-hidden rounded-full ring-1 ring-white/15">
                  <Image
                    src={agent.photo}
                    alt={`Portrait of ${agent.name}`}
                    fill
                    className="object-cover"
                    sizes="112px"
                  />
                </div>
                <h3 className="mt-5 text-lg font-semibold text-white">{agent.name}</h3>
                <p className="mt-1 text-sm font-medium text-brand-gold">{agent.title}</p>
                <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-white/60 transition-colors group-hover:text-brand-gold">
                  View profile <span aria-hidden="true">→</span>
                </span>
              </a>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
