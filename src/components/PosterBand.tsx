import { getPosterSeries } from "@/lib/poster-series";
import Reveal from "@/components/Reveal";
import SectionHeading from "@/components/SectionHeading";
import PosterMarquee from "@/components/PosterMarquee";

/** The homepage poster band: a short heading over the self-moving row of posters. */
export default async function PosterBand() {
  const posters = await getPosterSeries();
  if (posters.length === 0) return null;
  return (
    <section aria-label="Poster series" className="relative overflow-hidden py-10 sm:py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <SectionHeading kicker="Poster series" title="Dubai, in frames" />
          <Reveal delay={0.15}>
            <p className="max-w-sm text-sm leading-relaxed text-brand-ink/60">Tap a poster to see it full screen. The band pauses when you point at it.</p>
          </Reveal>
        </div>
      </div>
      <PosterMarquee posters={posters} />
    </section>
  );
}
