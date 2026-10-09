import Image from "next/image";
import { isServedImage } from "@/lib/image-url";
import { getAgents } from "@/lib/agents-data";
import Reveal from "@/components/Reveal";
import SectionHeading from "@/components/SectionHeading";

export default async function CeoSection() {
  const agents = await getAgents();
  const ceo = agents.find((a) => a.bio) ?? agents[0];
  if (!ceo) return null;

  return (
    <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
      <div className="grid items-center gap-12 lg:grid-cols-[minmax(0,380px)_1fr]">
        <Reveal className="mx-auto w-full max-w-sm">
          <div className="relative">
            <div className="absolute -inset-3 -z-10 rounded-[2rem] bg-brand-gold/15" />
            <div className="glass shimmer-border group aspect-square w-full overflow-hidden rounded-[1.75rem] p-1.5">
              <div className="flex h-full w-full items-center justify-center overflow-hidden rounded-[1.4rem]">
                <Image
                  src={ceo.photo}
                  unoptimized={isServedImage(ceo.photo)}
                  alt={`Portrait of ${ceo.name}`}
                  width={640}
                  height={640}
                  className="h-full w-full object-contain transition-transform duration-500 group-hover:scale-105"
                />
              </div>
            </div>
          </div>
        </Reveal>

        <div>
          <SectionHeading kicker="Leadership" title={ceo.name} />
          <Reveal delay={0.3}>
          <p className="mt-1 text-base font-medium text-brand-ink/60">{ceo.title}</p>

          {ceo.bio && (
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-brand-ink/75">{ceo.bio}</p>
          )}
          {ceo.background && (
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-brand-ink/60">
              {ceo.background}
            </p>
          )}

          {ceo.credentials && ceo.credentials.length > 0 && (
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
          )}

          {ceo.profileUrl && (
            <a
              href={ceo.profileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-8 inline-flex items-center gap-1.5 text-sm font-semibold text-heading hover:text-brand-gold"
            >
              View full leadership profile
              <span aria-hidden="true">→</span>
            </a>
          )}
          </Reveal>
        </div>
      </div>
    </section>
  );
}
