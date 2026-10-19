"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useInView, useReducedMotion, type Variants } from "framer-motion";
import { ArrowUpRight, MapPin, Play } from "lucide-react";
import { getFilmEmbedUrl, type ProjectFilm } from "@/lib/project-film-shared";

const EASE = [0.22, 1, 0.36, 1] as const;

// Renders from the developer's brochure, bundled with the site.
const POSTER = "/brand/binghatti/night-skyline.jpg";
const GALLERY = [
  { src: "/brand/binghatti/pool-aerial.jpg", alt: "Aerial view of the Grand Promenade pool terrace", span: "col-span-2" },
  { src: "/brand/binghatti/sunset-towers.jpg", alt: "The towers and park at sunset", span: "" },
  { src: "/brand/binghatti/lakeside.jpg", alt: "Towers rising above the lakeside", span: "" },
] as const;

/**
 * A landscape "project film" section: a large 16:9 player (Google Drive, YouTube
 * or Vimeo) framed under the project's name, with its key facts and a strip of
 * renders. The player only loads once the section nears the screen, so it costs
 * nothing until it's wanted; until it has loaded, a poster fills the frame.
 */
export default function ProjectFilmSection({ film }: { film: ProjectFilm }) {
  const reduce = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const near = useInView(sectionRef, { once: true, margin: "300px 0px" });
  const shown = useInView(sectionRef, { once: true, amount: 0.2 });
  const [loaded, setLoaded] = useState(false);
  const embed = getFilmEmbedUrl(film.videoUrl);
  if (!film.visible || !embed) return null;

  const container: Variants = { hidden: {}, show: { transition: { staggerChildren: reduce ? 0 : 0.1, delayChildren: 0.05 } } };
  const rise: Variants = {
    hidden: reduce ? { opacity: 0 } : { opacity: 0, y: 26, filter: "blur(6px)" },
    show: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: reduce ? 0.2 : 0.8, ease: EASE } },
  };
  const frame: Variants = {
    hidden: reduce ? { opacity: 0 } : { opacity: 0, y: 40, scale: 0.965 },
    show: { opacity: 1, y: 0, scale: 1, transition: { duration: reduce ? 0.2 : 1, ease: EASE } },
  };

  return (
    <section ref={sectionRef} aria-labelledby="project-film-title" className="relative overflow-hidden bg-brand-navy py-20 sm:py-28">
      <div className="grain-overlay" />
      <div className="glow-field" />

      <motion.div
        initial="hidden"
        animate={shown ? "show" : "hidden"}
        variants={container}
        className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8"
      >
        <div className="mx-auto max-w-3xl text-center">
          <motion.div variants={rise} className="flex items-center justify-center gap-2.5">
            <span className="h-px w-8 bg-brand-gold" />
            <span className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-gold">{film.kicker}</span>
            <span className="h-px w-8 bg-brand-gold" />
          </motion.div>
          <motion.h2 variants={rise} id="project-film-title" className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-5xl">
            {film.title}
          </motion.h2>
          {film.location && (
            <motion.p variants={rise} className="mt-4 flex items-center justify-center gap-1.5 text-xs font-medium uppercase tracking-[0.18em] text-white/55">
              <MapPin size={13} strokeWidth={1.75} className="text-brand-gold" />
              {film.location}
            </motion.p>
          )}
        </div>

        {/* The player — always landscape. */}
        <motion.div variants={frame} className="relative mt-10 sm:mt-12">
          <div className="absolute -inset-3 -z-0 rounded-[2rem] bg-brand-gold/10 blur-2xl" aria-hidden="true" />
          <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-black shadow-[0_40px_90px_-35px_rgba(0,0,0,0.85)] ring-1 ring-white/15 sm:rounded-3xl">
            <Image
              src={POSTER}
              alt=""
              fill
              sizes="(min-width: 1152px) 1152px, 100vw"
              className={`object-cover transition-opacity duration-700 ${loaded ? "opacity-0" : "opacity-100"}`}
              priority={false}
            />
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

        <div className="mt-12 grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
          <div>
            {film.description && (
              <motion.p variants={rise} className="max-w-2xl text-base leading-relaxed text-white/70 sm:text-lg">
                {film.description}
              </motion.p>
            )}
            {film.facts.length > 0 && (
              <dl className="mt-8 grid max-w-md grid-cols-2 gap-x-8 gap-y-6">
                {film.facts.map((f) => (
                  <motion.div key={`${f.value}-${f.label}`} variants={rise} className="border-l border-white/15 pl-4">
                    <dd className="whitespace-nowrap text-xl font-semibold tracking-tight text-white sm:text-2xl">{f.value}</dd>
                    <dt className="mt-1 text-[11px] font-medium uppercase tracking-[0.16em] text-white/50">{f.label}</dt>
                  </motion.div>
                ))}
              </dl>
            )}
            <motion.div variants={rise} className="mt-9">
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

          <motion.div variants={rise} className="grid grid-cols-2 gap-3 sm:gap-4">
            {GALLERY.map((g) => (
              <div key={g.src} className={`group relative overflow-hidden rounded-2xl ring-1 ring-white/10 ${g.span} ${g.span ? "aspect-[16/9]" : "aspect-[3/4]"}`}>
                <Image
                  src={g.src}
                  alt={g.alt}
                  fill
                  sizes="(min-width: 1024px) 28vw, 50vw"
                  className="object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-105"
                />
              </div>
            ))}
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}
