import Image from "next/image";
import { ceo } from "@/lib/content";
import Reveal from "@/components/Reveal";

export default function CeoSection() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
      <div className="grid items-center gap-12 lg:grid-cols-[minmax(0,380px)_1fr]">
        <Reveal className="mx-auto w-full max-w-sm">
          <div className="relative">
            <div className="absolute -inset-3 -z-10 rounded-[2rem] bg-brand-gold/15" />
            <Image
              src={ceo.photo}
              alt={`Portrait of ${ceo.name}`}
              width={640}
              height={640}
              className="glass shimmer-border aspect-square w-full rounded-[1.75rem] object-cover object-top p-1.5"
            />
          </div>
        </Reveal>

        <Reveal delay={0.12}>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-gold">
            Leadership
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-heading sm:text-4xl">
            {ceo.name}
          </h2>
          <p className="mt-1 text-base font-medium text-brand-ink/60">{ceo.title}</p>

          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-brand-ink/75">{ceo.bio}</p>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-brand-ink/60">
            {ceo.background}
          </p>

          <ul className="mt-6 flex flex-wrap gap-3">
            {ceo.credentials.map((item) => (
              <li
                key={item}
                className="glass rounded-full px-4 py-1.5 text-sm font-medium text-brand-ink/70"
              >
                {item}
              </li>
            ))}
          </ul>

          <a
            href={ceo.profileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-8 inline-flex items-center gap-1.5 text-sm font-semibold text-heading hover:text-brand-gold"
          >
            View full leadership profile
            <span aria-hidden="true">→</span>
          </a>
        </Reveal>
      </div>
    </section>
  );
}
