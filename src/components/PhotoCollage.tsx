import Image from "next/image";
import Link from "next/link";
import { ceo, agents, company } from "@/lib/content";
import Reveal from "@/components/Reveal";

export default function PhotoCollage() {
  return (
    <section className="relative overflow-hidden bg-brand-paper py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <Reveal>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-gold">
              Faces &amp; Places
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-heading sm:text-4xl">
              A real team, in the city we know best
            </h2>
            <p className="mt-5 max-w-lg text-lg leading-relaxed text-brand-ink/70">
              Every photo here is our own — the skyline we work in every day, and the people
              you&apos;ll actually speak with. No stock photography, no stand-ins.
            </p>
            <Link
              href="/about-us"
              className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-heading hover:text-brand-gold"
            >
              Meet the full team
              <span aria-hidden="true">→</span>
            </Link>
          </Reveal>

          <Reveal delay={0.1}>
            <div>
              <div className="group relative aspect-[16/10] overflow-hidden rounded-3xl shadow-[0_24px_60px_-24px_rgba(13,16,49,0.35)]">
                <Image
                  src="/brand/hero-dubai-skyline.jpg"
                  alt="Dubai skyline — where Meteorite operates"
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  sizes="(max-width: 1024px) 90vw, 560px"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-brand-navy/60 via-brand-navy/5 to-transparent" />
                <p className="absolute bottom-4 left-5 text-sm font-semibold uppercase tracking-wide text-white">
                  Dubai, UAE
                </p>
                <div className="glass glass-dark absolute right-4 top-4 rounded-full px-4 py-1.5 text-xs font-semibold text-white">
                  Since 2005
                </div>
              </div>

              <div className="mt-4 grid grid-cols-3 gap-4">
                {agents.map((agent) => (
                  <div
                    key={agent.name}
                    className="group relative aspect-square overflow-hidden rounded-2xl shadow-[0_12px_30px_-16px_rgba(13,16,49,0.4)]"
                  >
                    <Image
                      src={agent.photo}
                      alt={agent.name}
                      fill
                      className="object-cover object-top transition-transform duration-500 group-hover:scale-110"
                      sizes="(max-width: 1024px) 30vw, 180px"
                    />
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-brand-navy/85 to-transparent px-3 pb-2.5 pt-6">
                      <p className="truncate text-xs font-semibold text-white">
                        {agent.name === ceo.name ? ceo.name.split(" ")[0] : agent.name.split(" ")[0]}
                      </p>
                      <p className="truncate text-[10px] text-white/60">{agent.title}</p>
                    </div>
                  </div>
                ))}
              </div>

              <p className="mt-4 text-center text-xs text-brand-ink/40">
                {company.name} — {agents.length} of our licensed agents, in Dubai
              </p>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
