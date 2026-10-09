import Image from "next/image";
import { ArrowUpRight, MapPin } from "lucide-react";
import { featuredImageSrc, type FeaturedProject } from "@/lib/featured-project-shared";
import Reveal from "@/components/Reveal";
import SectionHeading from "@/components/SectionHeading";

function hostnameOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}

/**
 * An editorial "featured project" panel: quiet typography, hairline details and
 * the project's real facts — written to read like a recommendation from the
 * brokerage rather than a banner ad. Everything (copy, link, photo, visibility)
 * is managed from Admin → Homepage. Without a photo it falls back to a
 * typographic panel, so it never shows an empty or broken image slot.
 */
export default function FeaturedProjectSection({ project }: { project: FeaturedProject }) {
  if (!project.visible || !project.name) return null;

  const imageSrc = featuredImageSrc(project);
  const host = hostnameOf(project.linkUrl);
  // With a photo, facts sit under the description. Without one, they move into the
  // right-hand panel as a spec sheet, so the panel is never empty and nothing repeats.
  const factsInPanel = !imageSrc && project.facts.length > 0;

  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8" aria-labelledby="featured-project-title">
      <Reveal>
        <div className="relative overflow-hidden rounded-[1.75rem] bg-brand-navy shadow-[0_30px_70px_-35px_rgba(10,12,40,0.7)] ring-1 ring-white/10">
          <div className="grain-overlay" />
          <div className="relative grid lg:grid-cols-[1.05fr_0.95fr]">
            <div className="flex flex-col justify-center p-7 sm:p-12 lg:p-14">
              <SectionHeading
                kicker={project.kicker}
                title={<span id="featured-project-title">{project.name}</span>}
                theme="light"
              />

              {project.location && (
                <p className="mt-4 flex items-center gap-1.5 text-xs font-medium uppercase tracking-[0.18em] text-white/55">
                  <MapPin size={13} strokeWidth={1.75} className="text-brand-gold" />
                  {project.location}
                </p>
              )}

              {project.description && (
                <p className="mt-6 max-w-xl text-[15px] leading-relaxed text-white/70 sm:text-base">
                  {project.description}
                </p>
              )}

              {project.facts.length > 0 && !factsInPanel && (
                <dl className="mt-8 flex max-w-xl flex-wrap gap-x-8 gap-y-6">
                  {project.facts.map((f) => (
                    <div key={`${f.value}-${f.label}`} className="border-l border-white/15 pl-4">
                      <dd className="whitespace-nowrap text-xl font-semibold tracking-tight text-white sm:text-2xl">{f.value}</dd>
                      <dt className="mt-1 text-[11px] font-medium uppercase tracking-[0.16em] text-white/50">
                        {f.label}
                      </dt>
                    </div>
                  ))}
                </dl>
              )}

              <div className="mt-9 flex flex-wrap items-center gap-x-5 gap-y-3">
                <a
                  href={project.linkUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex items-center gap-2 rounded-full border border-brand-gold/60 px-6 py-3 text-sm font-semibold text-brand-gold transition-colors duration-200 hover:bg-brand-gold hover:text-brand-navy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold focus-visible:ring-offset-2 focus-visible:ring-offset-brand-navy"
                >
                  {project.linkLabel}
                  <ArrowUpRight size={16} className="transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </a>
                {host && <span className="text-xs text-white/40">{host}</span>}
              </div>
            </div>

            <div className="relative min-h-[16rem] sm:min-h-[22rem] lg:min-h-full">
              {imageSrc ? (
                <>
                  <Image
                    src={imageSrc}
                    alt={`${project.name}${project.location ? `, ${project.location}` : ""}`}
                    fill
                    unoptimized
                    sizes="(min-width: 1024px) 45vw, 100vw"
                    className="object-cover"
                  />
                  <div className="pointer-events-none absolute inset-y-0 left-0 hidden w-20 bg-gradient-to-r from-brand-navy to-transparent lg:block" />
                </>
              ) : (
                <div className="flex h-full min-h-[inherit] items-center justify-center bg-brand-navy-light p-6 sm:p-10">
                  <div className="flex h-full w-full max-w-sm flex-col justify-center rounded-2xl border border-white/10 px-7 py-9 sm:px-9">
                    {factsInPanel ? (
                      <dl className="divide-y divide-white/10">
                        {project.facts.map((f) => (
                          <div key={`${f.value}-${f.label}`} className="py-5 first:pt-0 last:pb-0">
                            <dt className="text-[11px] font-semibold uppercase tracking-[0.2em] text-brand-gold">
                              {f.label}
                            </dt>
                            <dd className="mt-1.5 text-3xl font-light tracking-tight text-white sm:text-4xl">{f.value}</dd>
                          </div>
                        ))}
                      </dl>
                    ) : (
                      <div className="text-center">
                        <p className="text-3xl font-light tracking-tight text-white">{project.name}</p>
                        <span className="mx-auto my-5 block h-px w-10 bg-brand-gold/60" />
                        {project.location && (
                          <p className="text-xs font-medium uppercase tracking-[0.3em] text-white/45">{project.location}</p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
