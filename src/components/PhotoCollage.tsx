import Image from "next/image";
import Link from "next/link";
import { ceo, agents } from "@/lib/content";
import Reveal from "@/components/Reveal";

export default function PhotoCollage() {
  const [hattab, meher] = agents.slice(1);

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
            <div className="grid grid-cols-6 grid-rows-6 gap-3 sm:gap-4" style={{ aspectRatio: "6 / 5" }}>
              <div className="group relative col-span-4 row-span-4 overflow-hidden rounded-3xl shadow-[0_20px_50px_-20px_rgba(13,16,49,0.35)]">
                <Image
                  src="/brand/hero-dubai-skyline.jpg"
                  alt="Dubai skyline — where Meteorite operates"
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                  sizes="(max-width: 1024px) 60vw, 400px"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-brand-navy/50 via-transparent to-transparent" />
                <p className="absolute bottom-3 left-4 text-xs font-semibold uppercase tracking-wide text-white/90">
                  Dubai, UAE
                </p>
              </div>

              <div className="group relative col-span-2 row-span-3 overflow-hidden rounded-3xl shadow-[0_16px_40px_-18px_rgba(13,16,49,0.35)]">
                <Image
                  src={ceo.photo}
                  alt={ceo.name}
                  fill
                  className="object-cover object-top transition-transform duration-700 group-hover:scale-110"
                  sizes="200px"
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-brand-navy/80 to-transparent p-3">
                  <p className="text-[11px] font-semibold text-white">{ceo.name.split(" ")[0]}</p>
                </div>
              </div>

              <div className="group relative col-span-2 row-span-3 overflow-hidden rounded-3xl shadow-[0_16px_40px_-18px_rgba(13,16,49,0.35)]">
                <Image
                  src={hattab.photo}
                  alt={hattab.name}
                  fill
                  className="object-cover object-top transition-transform duration-700 group-hover:scale-110"
                  sizes="200px"
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-brand-navy/80 to-transparent p-3">
                  <p className="text-[11px] font-semibold text-white">{hattab.name.split(" ")[0]}</p>
                </div>
              </div>

              <div className="group relative col-span-2 row-span-2 overflow-hidden rounded-3xl shadow-[0_16px_40px_-18px_rgba(13,16,49,0.35)]">
                <Image
                  src={meher.photo}
                  alt={meher.name}
                  fill
                  className="object-cover object-top transition-transform duration-700 group-hover:scale-110"
                  sizes="200px"
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-brand-navy/80 to-transparent p-3">
                  <p className="text-[11px] font-semibold text-white">{meher.name.split(" ")[0]}</p>
                </div>
              </div>

              <div className="glass shimmer-border col-span-4 row-span-2 flex flex-col items-center justify-center rounded-3xl text-center">
                <p className="text-2xl font-semibold tracking-tight text-heading">2005</p>
                <p className="text-xs font-medium text-brand-ink/50">Serving Dubai since</p>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
