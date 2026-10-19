"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useInView, useReducedMotion, type Variants } from "framer-motion";
import { ArrowUpRight, ChevronLeft, ChevronRight, MapPin, Play } from "lucide-react";
import { getFilmEmbedUrl, type ProjectFilm } from "@/lib/project-film-shared";

const EASE = [0.22, 1, 0.36, 1] as const;

function FilmGallery({ film }: { film: ProjectFilm }) {
  const reduce = useReducedMotion();
  const scroller = useRef<HTMLUListElement>(null);
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.15 });

  function nudge(dir: 1 | -1) {
    const el = scroller.current;
    if (el) el.scrollBy({ left: dir * Math.max(320, el.clientWidth * 0.7), behavior: reduce ? "auto" : "smooth" });
  }

  return (
    <div ref={ref} className="relative mt-14 sm:mt-16" role="group" aria-roledescription="carousel" aria-label={`${film.title} — gallery`}>
      <ul
        ref={scroller}
        tabIndex={0}
        className="flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth px-4 pb-4 [scrollbar-width:none] sm:gap-5 sm:px-6 lg:px-[max(2rem,calc((100vw-72rem)/2))] [&::-webkit-scrollbar]:hidden"
        style={{ scrollPaddingInline: "1rem" }}
      >
        {film.images.map((img, i) => (
          <motion.li
            key={img.src}
            initial={reduce ? { opacity: 0 } : { opacity: 0, x: 60 }}
            animate={inView ? { opacity: 1, x: 0 } : undefined}
            transition={{ duration: reduce ? 0.2 : 0.8, delay: reduce ? 0 : Math.min(i, 5) * 0.09, ease: EASE }}
            style={{ aspectRatio: img.ratio }}
            className="group relative h-[240px] flex-none snap-start overflow-hidden rounded-2xl bg-white/5 ring-1 ring-white/10 sm:h-[340px] lg:h-[420px]"
          >
            <Image
              src={img.src}
              alt={img.alt}
              fill
              sizes="(min-width: 1024px) 600px, 80vw"
              className="object-cover transition-transform duration-[1400ms] ease-out group-hover:scale-[1.04]"
            />
          </motion.li>
        ))}
        <li aria-hidden="true" className="w-1 flex-none" />
      </ul>

      <div className="mx-auto mt-2 flex max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <p className="text-xs text-white/40">Swipe or scroll →</p>
        <div className="flex items-center gap-2">
          {([[-1, "Previous images", ChevronLeft], [1, "Next images", ChevronRight]] as const).map(([dir, label, Icon]) => (
            <button
              key={label}
              type="button"
              onClick={() => nudge(dir)}
              aria-label={label}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 text-white/80 transition-colors hover:border-brand-gold hover:text-brand-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold"
            >
              <Icon size={18} />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function FilmBlock({ film, index }: { film: ProjectFilm; index: number }) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLElement>(null);
  const near = useInView(ref, { once: true, margin: "300px 0px" });
  const shown = useInView(ref, { once: true, amount: 0.15 });
  const [loaded, setLoaded] = useState(false);
  const embed = getFilmEmbedUrl(film.videoUrl);
  if (!embed) return null;

  const container: Variants = { hidden: {}, show: { transition: { staggerChildren: reduce ? 0 : 0.1, delayChildren: 0.05 } } };
  const rise: Variants = {
    hidden: reduce ? { opacity: 0 } : { opacity: 0, y: 26, filter: "blur(6px)" },
    show: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: reduce ? 0.2 : 0.8, ease: EASE } },
  };

  return (
    <section
      ref={ref}
      id={`film-${film.id}`}
      aria-labelledby={`film-title-${film.id}`}
      className={`relative overflow-hidden bg-brand-navy pb-16 sm:pb-24 ${index === 0 ? "pt-20 sm:pt-28" : "pt-4 sm:pt-8"}`}
    >
      <div className="grain-overlay" />
      {index === 0 && <div className="glow-field" />}
      {index > 0 && (
        <div className="relative mx-auto mb-14 h-px max-w-6xl bg-gradient-to-r from-transparent via-white/15 to-transparent sm:mb-20" aria-hidden="true" />
      )}

      <motion.div initial="hidden" animate={shown ? "show" : "hidden"} variants={container} className="relative">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
          <motion.div variants={rise} className="flex items-center justify-center gap-2.5">
            <span className="h-px w-8 bg-brand-gold" />
            <span className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-gold">{film.kicker}</span>
            <span className="h-px w-8 bg-brand-gold" />
          </motion.div>
          <motion.h2 variants={rise} id={`film-title-${film.id}`} className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-5xl">
            {film.title}
          </motion.h2>
          {film.location && (
            <motion.p variants={rise} className="mt-4 flex items-center justify-center gap-1.5 text-xs font-medium uppercase tracking-[0.18em] text-white/55">
              <MapPin size={13} strokeWidth={1.75} className="flex-none text-brand-gold" />
              {film.location}
            </motion.p>
          )}
        </div>

        {/* The player runs edge to edge: the full width of the screen, always landscape. */}
        <motion.div
          variants={{
            hidden: reduce ? { opacity: 0 } : { opacity: 0, scale: 0.98 },
            show: { opacity: 1, scale: 1, transition: { duration: reduce ? 0.2 : 1, ease: EASE } },
          }}
          className="relative mt-10 w-full sm:mt-12"
        >
          <div className="relative aspect-video max-h-[92vh] w-full overflow-hidden bg-black shadow-[0_40px_90px_-35px_rgba(0,0,0,0.85)] ring-1 ring-white/10">
            {film.poster && (
              <Image
                src={film.poster}
                alt=""
                fill
                sizes="100vw"
                className={`object-cover transition-opacity duration-700 ${loaded ? "opacity-0" : "opacity-100"}`}
              />
            )}
            {!loaded && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/35">
                <span className="flex h-16 w-16 items-center justify-center rounded-full bg-white/15 text-white ring-1 ring-white/40 backdrop-blur-md">
                  <Play size={24} fill="currentColor" className="ml-0.5" />
                </span>
              </div>
            )}
            {near && (
              <iframe
                src={embed}
                title={`${film.title} — project film`}
                loading="lazy"
                allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
                allowFullScreen
                referrerPolicy="strict-origin-when-cross-origin"
                onLoad={() => setLoaded(true)}
                className="absolute inset-0 h-full w-full border-0"
              />
            )}
          </div>
        </motion.div>

        {(film.description || film.facts.length > 0) && (
          <div className="mx-auto mt-12 grid max-w-6xl gap-10 px-4 sm:px-6 lg:grid-cols-[1.25fr_0.75fr] lg:items-start lg:gap-16 lg:px-8">
            <div>
              {film.description && (
                <motion.p variants={rise} className="max-w-2xl text-base leading-relaxed text-white/70 sm:text-lg">
                  {film.description}
                </motion.p>
              )}
              <motion.div variants={rise} className="mt-8">
                <Link
                  prefetch={false}
                  href="/contact-us"
                  className="group inline-flex items-center gap-2 rounded-full border border-brand-gold/60 px-6 py-3 text-sm font-semibold text-brand-gold transition-colors duration-300 hover:bg-brand-gold hover:text-brand-navy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold focus-visible:ring-offset-2 focus-visible:ring-offset-brand-navy"
                >
                  Enquire about this project
                  <ArrowUpRight size={16} className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </Link>
              </motion.div>
            </div>
            {film.facts.length > 0 && (
              <dl className="grid grid-cols-2 gap-x-8 gap-y-7">
                {film.facts.map((f) => (
                  <motion.div key={`${f.value}-${f.label}`} variants={rise} className="border-l border-white/15 pl-4">
                    <dd className="text-xl font-semibold tracking-tight text-white sm:text-2xl">{f.value}</dd>
                    <dt className="mt-1 text-[11px] font-medium uppercase tracking-[0.16em] text-white/50">{f.label}</dt>
                  </motion.div>
                ))}
              </dl>
            )}
          </div>
        )}

        {film.images.length > 0 && <FilmGallery film={film} />}
      </motion.div>
    </section>
  );
}

/** The homepage "Project films" band: one or more projects, each with a full-width video, its details and a swipeable gallery. */
export default function ProjectFilmsSection({ films }: { films: ProjectFilm[] }) {
  const visible = films.filter((f) => f.visible);
  if (visible.length === 0) return null;
  return (
    <>
      {visible.map((film, i) => (
        <FilmBlock key={film.id} film={film} index={i} />
      ))}
    </>
  );
}
