"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useInView, useReducedMotion, useScroll, useSpring, type Variants } from "framer-motion";
import { ArrowUpRight, ChevronLeft, ChevronRight, Download, MapPin, Play, Volume2, VolumeX } from "lucide-react";
import { getFilmVideo, type ProjectFilm, type ProjectFilmsConfig } from "@/lib/project-film-shared";
import ImageLightbox from "@/components/ImageLightbox";

const EASE = [0.22, 1, 0.36, 1] as const;

/** A tidy file name for a downloaded sheet: "Etherea JVC offer sheet" -> "etherea-jvc-offer-sheet.jpg". */
function downloadName(alt: string, src: string): string {
  const ext = /\.(jpe?g|png|webp)(?:\?|$)/i.exec(src)?.[1]?.toLowerCase().replace("jpeg", "jpg") ?? "jpg";
  const base = alt.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60) || "offer";
  return `${base}.${ext}`;
}

/** Big outlined index numeral that sits behind a project's title. */
function Numeral({ n, className = "" }: { n: number; className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={`pointer-events-none select-none font-semibold leading-none tracking-tighter text-transparent [-webkit-text-stroke:1px_rgba(233,221,122,0.28)] ${className}`}
    >
      {String(n).padStart(2, "0")}
    </span>
  );
}

function Facts({ film, rise }: { film: ProjectFilm; rise: Variants }) {
  if (film.facts.length === 0) return null;
  return (
    <dl className="grid grid-cols-2 gap-x-8 gap-y-7">
      {film.facts.map((f) => (
        <motion.div key={`${f.value}-${f.label}`} variants={rise} className="border-l border-brand-gold/30 pl-4">
          <dd className="text-xl font-semibold tracking-tight text-white sm:text-2xl">{f.value}</dd>
          <dt className="mt-1 text-[11px] font-medium uppercase tracking-[0.16em] text-white/50">{f.label}</dt>
        </motion.div>
      ))}
    </dl>
  );
}

function Enquire({ rise }: { rise: Variants }) {
  return (
    <motion.div variants={rise} className="mt-8">
      <Link
        prefetch={false}
        href="/contact-us"
        className="group inline-flex items-center gap-2 rounded-full border border-brand-gold/60 px-6 py-3 text-sm font-semibold text-brand-gold transition-colors duration-300 hover:bg-brand-gold hover:text-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold focus-visible:ring-offset-2 focus-visible:ring-offset-black"
      >
        Enquire about this project
        <ArrowUpRight size={16} className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
      </Link>
    </motion.div>
  );
}

/**
 * The film player. A real video file (Google Drive, a bundled mp4, a direct link)
 * starts by itself — muted, looping, no controls and no third-party buttons — and
 * only plays while it is on screen. A round button turns the sound on. YouTube and
 * Vimeo links start muted the same way. People who prefer reduced motion get the
 * poster and a play button instead of autoplay. The file is only requested once
 * the player is near the screen.
 */
function Player({ film, near, className }: { film: ProjectFilm; near: boolean; className: string }) {
  const reduce = useReducedMotion();
  const wrap = useRef<HTMLDivElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const visible = useInView(wrap, { amount: 0.35 });
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(true);
  const [failed, setFailed] = useState(false);
  const [needsTap, setNeedsTap] = useState(false);
  const media = film.videoUrl ? getFilmVideo(film.videoUrl) : null;
  const poster = film.poster || film.images[0]?.src || "";

  useEffect(() => {
    const el = video.current;
    if (!el || media?.kind !== "file") return;
    if (visible && !reduce) {
      el.play().then(() => setNeedsTap(false)).catch(() => setNeedsTap(true));
    } else {
      el.pause();
    }
  }, [visible, reduce, media?.kind, near, failed]);

  const fallbackSrc = media?.kind === "file" && failed ? media.fallback : undefined;
  const embedSrc = media?.kind === "embed" ? media.src : fallbackSrc;

  return (
    <div ref={wrap} className={`relative overflow-hidden bg-black ${className}`}>
      {poster && (
        <Image src={poster} alt="" fill sizes="(min-width: 1024px) 50vw, 100vw" className={`object-cover transition-opacity duration-700 ${playing ? "opacity-0" : "opacity-100"}`} />
      )}

      {media?.kind === "file" && !failed && near && (
        <video
          ref={video}
          src={media.src}
          muted={muted}
          loop
          playsInline
          preload="auto"
          disablePictureInPicture
          controlsList="nodownload noplaybackrate noremoteplayback"
          aria-label={`${film.title} — film`}
          onPlaying={() => setPlaying(true)}
          onError={() => setFailed(true)}
          className="absolute inset-0 h-full w-full object-cover"
        />
      )}
      {embedSrc && near && (
        <iframe
          src={embedSrc}
          title={`${film.title} — film`}
          loading="lazy"
          allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
          allowFullScreen
          referrerPolicy="strict-origin-when-cross-origin"
          onLoad={() => setPlaying(true)}
          className="absolute inset-0 h-full w-full border-0"
        />
      )}

      {/* Only when the browser refuses to autoplay, or for reduced-motion visitors. */}
      {media?.kind === "file" && !failed && !playing && (needsTap || reduce) && (
        <button
          type="button"
          onClick={() => video.current?.play().then(() => setNeedsTap(false)).catch(() => undefined)}
          aria-label="Play film"
          className="absolute inset-0 flex items-center justify-center bg-black/35"
        >
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-white/15 text-white ring-1 ring-white/40 backdrop-blur-md">
            <Play size={24} fill="currentColor" className="ml-0.5" />
          </span>
        </button>
      )}

      {media?.kind === "file" && !failed && playing && (
        <button
          type="button"
          onClick={() => setMuted((m) => !m)}
          aria-label={muted ? "Turn sound on" : "Turn sound off"}
          aria-pressed={!muted}
          className="absolute bottom-3 right-3 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-black/55 text-white ring-1 ring-white/25 backdrop-blur transition-colors hover:bg-black/75 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold sm:bottom-4 sm:right-4"
        >
          {muted ? <VolumeX size={17} /> : <Volume2 size={17} />}
        </button>
      )}
    </div>
  );
}

/** Landscape layout: the video runs edge to edge, then the details and a swipeable image strip. */
function CinemaFilm({ film, index }: { film: ProjectFilm; index: number }) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const stripRef = useRef<HTMLUListElement>(null);
  const near = useInView(ref, { once: true, margin: "300px 0px" });
  const shown = useInView(ref, { once: true, amount: 0.12 });
  const container: Variants = { hidden: {}, show: { transition: { staggerChildren: reduce ? 0 : 0.1, delayChildren: 0.05 } } };
  const rise: Variants = {
    hidden: reduce ? { opacity: 0 } : { opacity: 0, y: 26, filter: "blur(6px)" },
    show: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: reduce ? 0.2 : 0.8, ease: EASE } },
  };
  const nudge = (dir: 1 | -1) => {
    const el = stripRef.current;
    if (el) el.scrollBy({ left: dir * Math.max(320, el.clientWidth * 0.7), behavior: reduce ? "auto" : "smooth" });
  };

  return (
    <motion.div ref={ref} initial="hidden" animate={shown ? "show" : "hidden"} variants={container} className="relative">
      <div className="relative mx-auto max-w-3xl px-4 text-center sm:px-6">
        <Numeral n={index + 1} className="absolute left-1/2 top-1/2 -z-0 -translate-x-1/2 -translate-y-[55%] text-[9rem] sm:text-[13rem]" />
        <div className="relative">
          <motion.div variants={rise} className="flex items-center justify-center gap-2.5">
            <span className="h-px w-8 bg-brand-gold" />
            <span className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-gold">{film.kicker}</span>
            <span className="h-px w-8 bg-brand-gold" />
          </motion.div>
          <motion.h3 variants={rise} className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">{film.title}</motion.h3>
          {film.location && (
            <motion.p variants={rise} className="mt-4 flex items-center justify-center gap-1.5 text-xs font-medium uppercase tracking-[0.18em] text-white/55">
              <MapPin size={13} strokeWidth={1.75} className="flex-none text-brand-gold" />
              {film.location}
            </motion.p>
          )}
        </div>
      </div>

      {(film.videoUrl || film.poster) && (
        <motion.div
          variants={{
            hidden: reduce ? { opacity: 0 } : { opacity: 0, scale: 0.98 },
            show: { opacity: 1, scale: 1, transition: { duration: reduce ? 0.2 : 1, ease: EASE } },
          }}
          className="relative mt-10 w-full sm:mt-12"
        >
          <Player film={film} near={near} className="aspect-video max-h-[92vh] w-full shadow-[0_40px_90px_-35px_rgba(0,0,0,0.9)] ring-1 ring-white/10" />
        </motion.div>
      )}

      {(film.description || film.facts.length > 0) && (
        <div className="mx-auto mt-12 grid max-w-6xl gap-10 px-4 sm:px-6 lg:grid-cols-[1.25fr_0.75fr] lg:items-start lg:gap-16 lg:px-8">
          <div>
            {film.description && (
              <motion.p variants={rise} className="max-w-2xl text-base leading-relaxed text-white/70 sm:text-lg">{film.description}</motion.p>
            )}
            <Enquire rise={rise} />
          </div>
          <Facts film={film} rise={rise} />
        </div>
      )}

      {film.images.length > 0 && (
        <div className="relative mt-14 sm:mt-16" role="group" aria-roledescription="carousel" aria-label={`${film.title} — gallery`}>
          <ul
            ref={stripRef}
            tabIndex={0}
            className="flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth px-4 pb-4 [scrollbar-width:none] sm:gap-5 sm:px-6 lg:px-[max(2rem,calc((100vw-72rem)/2))] [&::-webkit-scrollbar]:hidden"
            style={{ scrollPaddingInline: "1rem" }}
          >
            {film.images.map((img, i) => (
              <motion.li
                key={img.src}
                initial={reduce ? { opacity: 0 } : { opacity: 0, x: 60 }}
                animate={shown ? { opacity: 1, x: 0 } : undefined}
                transition={{ duration: reduce ? 0.2 : 0.8, delay: reduce ? 0 : Math.min(i, 5) * 0.09, ease: EASE }}
                style={{ aspectRatio: img.ratio }}
                className="group relative h-[240px] flex-none snap-start overflow-hidden rounded-2xl bg-white/5 ring-1 ring-white/10 sm:h-[340px] lg:h-[420px]"
              >
                <Image src={img.src} alt={img.alt} fill sizes="(min-width: 1024px) 600px, 80vw" className="object-cover transition-transform duration-[1400ms] ease-out group-hover:scale-[1.04]" />
              </motion.li>
            ))}
            <li aria-hidden="true" className="w-1 flex-none" />
          </ul>
          <div className="mx-auto mt-2 flex max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
            <p className="text-xs text-white/40">Swipe or scroll →</p>
            <div className="flex items-center gap-2">
              {([[-1, "Previous images", ChevronLeft], [1, "Next images", ChevronRight]] as const).map(([dir, label, Icon]) => (
                <button key={label} type="button" onClick={() => nudge(dir)} aria-label={label} className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 text-white/80 transition-colors hover:border-brand-gold hover:text-brand-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold">
                  <Icon size={18} />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}

/** Portrait layout: a tall, phone-shaped player pinned beside the text, with the images as a zoomable mosaic. */
function ShowcaseFilm({ film, index }: { film: ProjectFilm; index: number }) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const near = useInView(ref, { once: true, margin: "300px 0px" });
  const shown = useInView(ref, { once: true, amount: 0.1 });
  const container: Variants = { hidden: {}, show: { transition: { staggerChildren: reduce ? 0 : 0.09, delayChildren: 0.05 } } };
  const rise: Variants = {
    hidden: reduce ? { opacity: 0 } : { opacity: 0, y: 26, filter: "blur(6px)" },
    show: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: reduce ? 0.2 : 0.8, ease: EASE } },
  };
  const hasVideo = Boolean(film.videoUrl || film.poster || film.images[0]);
  const head = (
    <div className="relative">
      <Numeral n={index + 1} className="absolute -left-2 -top-10 text-[8rem] sm:text-[11rem]" />
      <div className="relative pt-4">
        <motion.div variants={rise} className="flex items-center gap-2.5">
          <span className="h-px w-8 bg-brand-gold" />
          <span className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-gold">{film.kicker}</span>
        </motion.div>
        <motion.h3 variants={rise} className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">{film.title}</motion.h3>
        {film.location && (
          <motion.p variants={rise} className="mt-4 flex items-center gap-1.5 text-xs font-medium uppercase tracking-[0.18em] text-white/55">
            <MapPin size={13} strokeWidth={1.75} className="flex-none text-brand-gold" />
            {film.location}
          </motion.p>
        )}
      </div>
    </div>
  );

  return (
    <motion.div ref={ref} initial="hidden" animate={shown ? "show" : "hidden"} variants={container} className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
      <div className="mb-10 lg:hidden">{head}</div>
      <div className={`grid gap-12 ${hasVideo ? "lg:grid-cols-[minmax(0,360px)_1fr] lg:gap-16" : ""}`}>
        {hasVideo && (
          <motion.div
            variants={{
              hidden: reduce ? { opacity: 0 } : { opacity: 0, y: 40, rotate: -1.5 },
              show: { opacity: 1, y: 0, rotate: 0, transition: { duration: reduce ? 0.2 : 1, ease: EASE } },
            }}
            className="lg:sticky lg:top-24 lg:self-start"
          >
            <div className="relative mx-auto w-full max-w-[300px] sm:max-w-[340px] lg:max-w-none">
              <div aria-hidden="true" className="absolute -inset-6 rounded-[3rem] bg-brand-gold/15 blur-3xl" />
              <div className="relative rounded-[2.1rem] bg-gradient-to-b from-brand-gold/70 via-white/10 to-brand-gold/40 p-[2px] shadow-[0_40px_90px_-30px_rgba(0,0,0,0.9)]">
                <Player film={film} near={near} className="aspect-[9/16] max-h-[78vh] w-full rounded-[2rem]" />
              </div>
            </div>
          </motion.div>
        )}

        <div className="min-w-0">
          <div className="hidden lg:block">{head}</div>

          {film.description && (
            <motion.p variants={rise} className="mt-7 max-w-2xl text-base leading-relaxed text-white/70 sm:text-lg">{film.description}</motion.p>
          )}
          {film.facts.length > 0 && (
            <div className="mt-8 max-w-md">
              <Facts film={film} rise={rise} />
            </div>
          )}
          <Enquire rise={rise} />

          {film.images.length > 0 && (
            <motion.div variants={rise} className="mt-12">
              <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-white/45">Tap a sheet to enlarge · download any of them</p>
              <ul className="columns-2 gap-3 sm:gap-4 [&>li]:mb-3 sm:[&>li]:mb-4">
                {film.images.map((img) => (
                  <li key={img.src} className="group/tile relative break-inside-avoid overflow-hidden rounded-2xl ring-1 ring-white/10 transition-shadow duration-300 hover:ring-brand-gold/50">
                    <ImageLightbox src={img.src} alt={img.alt} downloadAs={downloadName(img.alt, img.src)}>
                      <span className="relative block w-full" style={{ aspectRatio: img.ratio }}>
                        <Image src={img.src} alt={img.alt} fill sizes="(min-width: 1024px) 380px, 46vw" className="object-cover transition-transform duration-[1200ms] ease-out group-hover/tile:scale-[1.03]" />
                      </span>
                    </ImageLightbox>
                    <a
                      href={img.src}
                      download={downloadName(img.alt, img.src)}
                      aria-label={`Download: ${img.alt}`}
                      title="Download"
                      className="absolute bottom-2 right-2 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-black/60 text-white ring-1 ring-white/25 backdrop-blur transition-colors hover:bg-brand-gold hover:text-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold"
                    >
                      <Download size={16} />
                    </a>
                  </li>
                ))}
              </ul>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

/**
 * The "Featured Developments" band. All projects share ONE obsidian-and-gold
 * backdrop and one heading, and a gold thread runs down the side connecting
 * them (it fills as you scroll), so they read as chapters of a single story.
 * Each project picks its layout from the video's shape: landscape = full-width
 * cinema, portrait = tall pinned player beside the content.
 */
export default function ProjectFilmsSection({ config }: { config: ProjectFilmsConfig }) {
  const reduce = useReducedMotion();
  const rootRef = useRef<HTMLElement>(null);
  const films = config.films.filter((f) => f.visible);
  const { scrollYProgress } = useScroll({ target: rootRef, offset: ["start 0.8", "end 0.6"] });
  const fill = useSpring(scrollYProgress, { stiffness: 90, damping: 24, mass: 0.4 });
  const headRef = useRef<HTMLDivElement>(null);
  const headShown = useInView(headRef, { once: true, amount: 0.3 });
  if (films.length === 0) return null;

  return (
    <section ref={rootRef} id="developments" aria-labelledby="developments-title" className="relative isolate overflow-hidden bg-[#09090b] pb-20 pt-20 text-white sm:pb-28 sm:pt-28">
      {/* backdrop: warm spotlight, diamond lattice, soft vignette, film grain */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-x-0 top-0 h-[60rem] bg-[radial-gradient(60%_50%_at_50%_0%,rgba(219,204,59,0.16),transparent_70%)]" />
        <div className="obsidian-lattice absolute inset-0 opacity-[0.07]" />
        <div className="absolute inset-x-0 bottom-0 h-72 bg-gradient-to-t from-black to-transparent" />
      </div>
      <div className="grain-overlay" />

      {/* the thread that ties the projects together */}
      {films.length > 1 && (
        <div aria-hidden="true" className="pointer-events-none absolute bottom-24 left-3 top-56 hidden w-px bg-white/10 sm:left-6 md:block">
          <motion.div style={{ scaleY: reduce ? 1 : fill, transformOrigin: "top" }} className="h-full w-px bg-gradient-to-b from-brand-gold via-brand-gold/70 to-brand-gold/10" />
        </div>
      )}

      <div ref={headRef} className="relative mx-auto max-w-3xl px-4 text-center sm:px-6">
        <motion.div initial={{ opacity: 0, y: reduce ? 0 : 20 }} animate={headShown ? { opacity: 1, y: 0 } : undefined} transition={{ duration: 0.8, ease: EASE }}>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-gold">Meteorite Real Estate presents</p>
          <h2 id="developments-title" className="gold-sheen mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
            {config.heading || "Featured Developments"}
          </h2>
          {config.intro && <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-white/60">{config.intro}</p>}
          <span className="mx-auto mt-8 block h-px w-24 bg-gradient-to-r from-transparent via-brand-gold to-transparent" />
        </motion.div>
      </div>

      <div className="relative mt-16 space-y-24 sm:mt-20 sm:space-y-32">
        {films.map((film, i) => (
          <article key={film.id} id={`film-${film.id}`} aria-label={film.title} className="relative">
            {films.length > 1 && (
              <span aria-hidden="true" className="absolute left-[10px] top-6 hidden h-[7px] w-[7px] rounded-full bg-brand-gold shadow-[0_0_0_4px_rgba(219,204,59,0.18)] sm:left-[22px] md:block" />
            )}
            {film.shape === "portrait" ? <ShowcaseFilm film={film} index={i} /> : <CinemaFilm film={film} index={i} />}
          </article>
        ))}
      </div>
    </section>
  );
}
