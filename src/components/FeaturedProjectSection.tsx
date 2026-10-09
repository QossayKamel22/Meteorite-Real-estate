"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import {
  AnimatePresence,
  animate,
  motion,
  useInView,
  useReducedMotion,
  type PanInfo,
  type Variants,
} from "framer-motion";
import { ArrowUpRight, ChevronLeft, ChevronRight, MapPin } from "lucide-react";
import type { FeaturedProject } from "@/lib/featured-project-shared";
import { isServedImage } from "@/lib/image-url";

const AUTOPLAY_MS = 7000;
const SWIPE_DISTANCE = 70;
const SWIPE_VELOCITY = 450;
const EASE = [0.22, 1, 0.36, 1] as const;

function hostnameOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}

/** Counts a pure number up from 0 when its card scrolls into view; anything else is shown as-is. */
function CountUp({ value, active }: { value: string; active: boolean }) {
  const reduce = useReducedMotion();
  const target = /^\d{1,6}$/.test(value) ? Number(value) : null;
  // Starts at the final value so server HTML and no-JS visitors see the real number.
  const [shown, setShown] = useState(target ?? 0);

  useEffect(() => {
    if (target === null || !active || reduce) return;
    const controls = animate(0, target, { duration: 1.6, ease: EASE, onUpdate: (v) => setShown(Math.round(v)) });
    return () => controls.stop();
  }, [target, active, reduce]);

  return <>{target === null ? value : shown.toLocaleString("en-US")}</>;
}

function ProjectCard({ project, priority }: { project: FeaturedProject; priority: boolean }) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.25 });
  const host = hostnameOf(project.linkUrl);
  const hasImage = Boolean(project.image);
  const factsInPanel = !hasImage && project.facts.length > 0;

  // One orchestrated entrance per card: the text column staggers in, then the visual.
  const container: Variants = {
    hidden: {},
    show: { transition: { staggerChildren: reduce ? 0 : 0.09, delayChildren: reduce ? 0 : 0.12 } },
  };
  const rise: Variants = {
    hidden: reduce ? { opacity: 0 } : { opacity: 0, y: 24, filter: "blur(6px)" },
    show: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: reduce ? 0.2 : 0.75, ease: EASE } },
  };
  const curtain: Variants = {
    hidden: reduce ? { opacity: 0 } : { y: "105%" },
    show: { opacity: 1, y: "0%", transition: { duration: reduce ? 0.2 : 0.85, ease: EASE } },
  };
  const line: Variants = {
    hidden: reduce ? { opacity: 0 } : { scaleX: 0 },
    show: { opacity: 1, scaleX: 1, transition: { duration: 0.7, ease: EASE } },
  };
  const reveal: Variants = {
    hidden: reduce ? { opacity: 0 } : { clipPath: "inset(0 0 0 100%)" },
    show: { opacity: 1, clipPath: "inset(0 0 0 0%)", transition: { duration: reduce ? 0.2 : 1.1, ease: EASE } },
  };
  const zoom: Variants = {
    hidden: reduce ? {} : { scale: 1.18 },
    show: { scale: 1, transition: { duration: reduce ? 0 : 1.9, ease: EASE } },
  };
  const rowIn: Variants = {
    hidden: reduce ? { opacity: 0 } : { opacity: 0, x: 28 },
    show: { opacity: 1, x: 0, transition: { duration: 0.7, ease: EASE } },
  };

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={inView ? "show" : "hidden"}
      variants={container}
      className="relative grid overflow-hidden rounded-[1.75rem] bg-brand-navy shadow-[0_30px_70px_-35px_rgba(10,12,40,0.7)] ring-1 ring-white/10 lg:grid-cols-[1.05fr_0.95fr]"
    >
      <div className="grain-overlay" />

      <div className="relative flex flex-col justify-center p-7 sm:p-12 lg:p-14">
        <motion.div variants={rise} className="flex items-center gap-2.5">
          <motion.span variants={line} style={{ transformOrigin: "left" }} className="h-px w-8 bg-brand-gold" />
          <span className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-gold">{project.kicker}</span>
        </motion.div>

        <div className="mt-3 overflow-hidden py-0.5">
          <motion.h2 variants={curtain} className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            {project.name}
          </motion.h2>
        </div>

        {project.location && (
          <motion.p
            variants={rise}
            className="mt-4 flex items-center gap-1.5 text-xs font-medium uppercase tracking-[0.18em] text-white/55"
          >
            <MapPin size={13} strokeWidth={1.75} className="text-brand-gold" />
            {project.location}
          </motion.p>
        )}

        {project.description && (
          <motion.p variants={rise} className="mt-6 max-w-xl text-[15px] leading-relaxed text-white/70 sm:text-base">
            {project.description}
          </motion.p>
        )}

        {project.facts.length > 0 && !factsInPanel && (
          <dl className="mt-8 flex max-w-xl flex-wrap gap-x-8 gap-y-6">
            {project.facts.map((f) => (
              <motion.div key={`${f.value}-${f.label}`} variants={rise} className="border-l border-white/15 pl-4">
                <dd className="whitespace-nowrap text-xl font-semibold tracking-tight text-white sm:text-2xl">
                  <CountUp value={f.value} active={inView} />
                </dd>
                <dt className="mt-1 text-[11px] font-medium uppercase tracking-[0.16em] text-white/50">{f.label}</dt>
              </motion.div>
            ))}
          </dl>
        )}

        <motion.div variants={rise} className="mt-9 flex flex-wrap items-center gap-x-5 gap-y-3">
          <a
            href={project.linkUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="group relative inline-flex items-center gap-2 overflow-hidden rounded-full border border-brand-gold/60 px-6 py-3 text-sm font-semibold text-brand-gold transition-colors duration-300 hover:bg-brand-gold hover:text-brand-navy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold focus-visible:ring-offset-2 focus-visible:ring-offset-brand-navy"
          >
            {project.linkLabel}
            <ArrowUpRight
              size={16}
              className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
            />
          </a>
          {host && <span className="text-xs text-white/40">{host}</span>}
        </motion.div>
      </div>

      <div className="relative min-h-[16rem] overflow-hidden sm:min-h-[22rem] lg:min-h-full">
        {hasImage ? (
          <motion.div variants={reveal} className="absolute inset-0">
            <motion.div variants={zoom} className="absolute inset-0">
              <Image
                src={project.image}
                alt={`${project.name}${project.location ? `, ${project.location}` : ""}`}
                fill
                priority={priority}
                unoptimized={isServedImage(project.image) || project.image.startsWith("data:")}
                sizes="(min-width: 1024px) 45vw, 100vw"
                className="object-cover"
              />
            </motion.div>
            <div className="pointer-events-none absolute inset-y-0 left-0 hidden w-20 bg-gradient-to-r from-brand-navy to-transparent lg:block" />
          </motion.div>
        ) : (
          <div className="flex h-full min-h-[inherit] items-center justify-center bg-brand-navy-light p-6 sm:p-10">
            <div className="flex h-full w-full max-w-sm flex-col justify-center rounded-2xl border border-white/10 px-7 py-9 sm:px-9">
              {factsInPanel ? (
                <dl className="divide-y divide-white/10">
                  {project.facts.map((f) => (
                    <motion.div key={`${f.value}-${f.label}`} variants={rowIn} className="py-5 first:pt-0 last:pb-0">
                      <dt className="text-[11px] font-semibold uppercase tracking-[0.2em] text-brand-gold">{f.label}</dt>
                      <dd className="mt-1.5 text-3xl font-light tracking-tight text-white sm:text-4xl">
                        <CountUp value={f.value} active={inView} />
                      </dd>
                    </motion.div>
                  ))}
                </dl>
              ) : (
                <motion.div variants={rowIn} className="text-center">
                  <p className="text-3xl font-light tracking-tight text-white">{project.name}</p>
                  <span className="mx-auto my-5 block h-px w-10 bg-brand-gold/60" />
                  {project.location && (
                    <p className="text-xs font-medium uppercase tracking-[0.3em] text-white/45">{project.location}</p>
                  )}
                </motion.div>
              )}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}

const slideVariants: Variants = {
  enter: (d: number) => ({ x: d * 90, opacity: 0, scale: 0.985 }),
  center: { x: 0, opacity: 1, scale: 1, transition: { duration: 0.75, ease: EASE } },
  exit: (d: number) => ({ x: d * -90, opacity: 0, scale: 0.985, transition: { duration: 0.5, ease: EASE } }),
};
const calmSlideVariants: Variants = {
  enter: { opacity: 0 },
  center: { opacity: 1, transition: { duration: 0.25 } },
  exit: { opacity: 0, transition: { duration: 0.2 } },
};

/**
 * Homepage "Featured Project" section. One project renders as a single animated
 * panel. Several render as a carousel that can be swiped / dragged, steered with
 * arrows, dots or the keyboard, and that advances by itself — pausing on hover,
 * focus and touch, when the tab is hidden, or when it's scrolled off screen, and
 * never autoplaying for people who prefer reduced motion.
 */
export default function FeaturedProjectSection({ projects }: { projects: FeaturedProject[] }) {
  const reduce = useReducedMotion();
  const count = projects.length;
  const rootRef = useRef<HTMLElement>(null);
  const inView = useInView(rootRef, { amount: 0.3 });
  const [[index, dir], setSlide] = useState<[number, number]>([0, 1]);
  const [paused, setPaused] = useState(false);
  const [tabHidden, setTabHidden] = useState(false);

  useEffect(() => {
    const onVisibility = () => setTabHidden(document.hidden);
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  const safeIndex = count > 0 ? index % count : 0;
  const goTo = useCallback(
    (to: number, direction?: number) =>
      setSlide(([current]) => [((to % count) + count) % count, direction ?? (to >= current ? 1 : -1)]),
    [count]
  );
  const next = useCallback(() => setSlide(([i]) => [(i + 1) % count, 1]), [count]);
  const prev = useCallback(() => setSlide(([i]) => [(i - 1 + count) % count, -1]), [count]);

  if (count === 0) return null;
  const multiple = count > 1;
  const playing = multiple && !reduce && !paused && !tabHidden && inView;

  function onDragEnd(_: PointerEvent | MouseEvent | TouchEvent, info: PanInfo) {
    setPaused(false);
    if (info.offset.x < -SWIPE_DISTANCE || info.velocity.x < -SWIPE_VELOCITY) next();
    else if (info.offset.x > SWIPE_DISTANCE || info.velocity.x > SWIPE_VELOCITY) prev();
  }

  return (
    <section
      ref={rootRef}
      aria-roledescription={multiple ? "carousel" : undefined}
      aria-label="Featured projects"
      className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
      onKeyDown={(e) => {
        if (!multiple) return;
        if (e.key === "ArrowRight") next();
        if (e.key === "ArrowLeft") prev();
      }}
    >
      <div className="grid">
        <AnimatePresence initial={false} custom={dir} mode="sync">
          <motion.div
            key={projects[safeIndex].id}
            custom={dir}
            variants={reduce ? calmSlideVariants : slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            drag={multiple ? "x" : false}
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.18}
            dragMomentum={false}
            onDragStart={() => setPaused(true)}
            onDragEnd={onDragEnd}
            style={{ touchAction: multiple ? "pan-y" : "auto", gridArea: "1 / 1" }}
            className={multiple ? "cursor-grab active:cursor-grabbing" : ""}
            aria-roledescription={multiple ? "slide" : undefined}
            aria-label={multiple ? `${safeIndex + 1} of ${count}` : undefined}
          >
            <ProjectCard project={projects[safeIndex]} priority={safeIndex === 0} />
          </motion.div>
        </AnimatePresence>
      </div>

      {multiple && (
        <div className="mt-6 flex items-center gap-4">
          <span className="w-14 flex-none text-sm font-medium tabular-nums text-brand-ink/50" aria-hidden="true">
            {String(safeIndex + 1).padStart(2, "0")}
            <span className="text-brand-ink/30"> / {String(count).padStart(2, "0")}</span>
          </span>

          <div className="flex flex-1 items-center gap-2" role="group" aria-label="Choose a project">
            {projects.map((p, i) => {
              const active = i === safeIndex;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => goTo(i)}
                  aria-label={`Show ${p.name} (${i + 1} of ${count})`}
                  aria-current={active ? "true" : undefined}
                  className="group flex h-6 flex-1 items-center focus-visible:outline-none"
                >
                  <span className="relative block h-[3px] w-full overflow-hidden rounded-full bg-brand-ink/15 transition-all duration-300 group-hover:h-[5px] group-focus-visible:ring-2 group-focus-visible:ring-brand-gold">
                    {i < safeIndex && <span className="absolute inset-0 rounded-full bg-brand-gold/70" />}
                    {active &&
                      (reduce || !multiple ? (
                        <span className="absolute inset-0 rounded-full bg-brand-gold" />
                      ) : (
                        <span
                          key={`${p.id}-${safeIndex}`}
                          className="fp-fill absolute inset-0 rounded-full bg-brand-gold"
                          style={{
                            animationDuration: `${AUTOPLAY_MS}ms`,
                            animationPlayState: playing ? "running" : "paused",
                          }}
                          onAnimationEnd={next}
                        />
                      ))}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="flex flex-none items-center gap-2">
            {[
              { label: "Previous project", onClick: prev, Icon: ChevronLeft },
              { label: "Next project", onClick: next, Icon: ChevronRight },
            ].map(({ label, onClick, Icon }) => (
              <button
                key={label}
                type="button"
                onClick={onClick}
                aria-label={label}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-brand-line bg-white text-heading shadow-sm transition-colors hover:border-brand-gold hover:text-brand-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold dark:bg-white/[0.06] dark:shadow-none"
              >
                <Icon size={18} />
              </button>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
