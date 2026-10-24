"use client";

import { useCallback, useRef, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion, useInView, useReducedMotion, type PanInfo, type Variants } from "framer-motion";
import { ArrowLeft, ArrowRight, ArrowUpRight } from "lucide-react";
import type { Agent } from "@/lib/agents-data";
import { isServedImage } from "@/lib/image-url";

const EASE = [0.22, 1, 0.36, 1] as const;
const SWIPE_DISTANCE = 70;
const SWIPE_VELOCITY = 450;

/** Paragraphs are separated by a blank line in the admin's text boxes. */
const paragraphs = (text: string | undefined) =>
  (text ?? "")
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);

const slideVariants: Variants = {
  enter: (d: number) => ({ x: d * 90, opacity: 0 }),
  center: { x: 0, opacity: 1, transition: { duration: 0.7, ease: EASE } },
  exit: (d: number) => ({ x: d * -90, opacity: 0, transition: { duration: 0.45, ease: EASE } }),
};
const calmVariants: Variants = {
  enter: { opacity: 0 },
  center: { opacity: 1, transition: { duration: 0.25 } },
  exit: { opacity: 0, transition: { duration: 0.15 } },
};

function Leader({ leader, first }: { leader: Agent; first: boolean }) {
  const reduce = useReducedMotion();
  const bio = paragraphs(leader.bio);
  const background = paragraphs(leader.background);

  const group: Variants = { center: { transition: { staggerChildren: reduce ? 0 : 0.09, delayChildren: reduce ? 0 : 0.18 } } };
  const rise: Variants = {
    enter: reduce ? { opacity: 0 } : { opacity: 0, y: 22, filter: "blur(5px)" },
    center: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: reduce ? 0.2 : 0.7, ease: EASE } },
  };
  const photo: Variants = {
    enter: reduce ? { opacity: 0 } : { opacity: 0, scale: 0.94, clipPath: "inset(0 0 100% 0 round 1.75rem)" },
    center: { opacity: 1, scale: 1, clipPath: "inset(0 0 0% 0 round 1.75rem)", transition: { duration: reduce ? 0.2 : 1, ease: EASE } },
  };

  return (
    <motion.div variants={group} className="grid items-center gap-12 lg:grid-cols-[minmax(0,380px)_1fr]">
      <div className="mx-auto w-full max-w-sm">
        <div className="relative">
          <motion.div variants={rise} aria-hidden="true" className="absolute -inset-3 -z-10 rounded-[2rem] bg-brand-gold/15" />
          <motion.div variants={photo} className="glass shimmer-border group aspect-square w-full overflow-hidden rounded-[1.75rem] p-1.5">
            <div className="flex h-full w-full items-center justify-center overflow-hidden rounded-[1.4rem]">
              <Image
                src={leader.photo}
                alt={`Portrait of ${leader.name}`}
                width={640}
                height={640}
                priority={first}
                unoptimized={isServedImage(leader.photo)}
                draggable={false}
                className="h-full w-full select-none object-contain transition-transform duration-500 group-hover:scale-105"
              />
            </div>
          </motion.div>
        </div>
      </div>

      <div>
        <motion.div variants={rise} className="flex items-center gap-2.5">
          <span className="h-px w-8 bg-brand-gold" />
          <span className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-gold">Leadership</span>
        </motion.div>
        <motion.h2 variants={rise} className="mt-3 text-3xl font-semibold tracking-tight text-heading sm:text-4xl">
          {leader.name}
        </motion.h2>
        <motion.p variants={rise} className="mt-1 text-base font-medium text-brand-ink/60">{leader.title}</motion.p>

        {bio.map((p, i) => (
          <motion.p
            key={`b${i}`}
            variants={rise}
            className={`max-w-2xl leading-relaxed ${i === 0 ? "mt-6 text-lg text-brand-ink/75" : "mt-4 text-base text-brand-ink/65"}`}
          >
            {p}
          </motion.p>
        ))}
        {background.map((p, i) => (
          <motion.p key={`g${i}`} variants={rise} className="mt-4 max-w-2xl text-base leading-relaxed text-brand-ink/60">
            {p}
          </motion.p>
        ))}

        {leader.credentials && leader.credentials.length > 0 && (
          <ul className="mt-6 flex flex-wrap gap-3">
            {leader.credentials.map((item) => (
              <motion.li key={item} variants={rise} className="glass rounded-full px-4 py-1.5 text-sm font-medium text-brand-ink/70">
                {item}
              </motion.li>
            ))}
          </ul>
        )}

        {leader.profileUrl && (
          <motion.div variants={rise}>
            <a
              href={leader.profileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-8 inline-flex items-center gap-1.5 text-sm font-semibold text-heading hover:text-brand-gold"
            >
              View full leadership profile
              <ArrowUpRight size={15} />
            </a>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}

/**
 * The Leadership section: one leader at a time, side by side with their story.
 * With more than one leader it becomes a horizontal carousel — swipe or drag,
 * use the arrows or the keyboard arrow keys, or tap a leader's photo in the rail
 * underneath. Everyone with a Leadership bio in Admin > Team appears here, in
 * team order. It never advances by itself (there is text to read).
 */
export default function LeadershipCarousel({ leaders }: { leaders: Agent[] }) {
  const reduce = useReducedMotion();
  const count = leaders.length;
  const multiple = count > 1;
  const rootRef = useRef<HTMLElement>(null);
  const shown = useInView(rootRef, { once: true, amount: 0.15 });
  const [[index, dir], setSlide] = useState<[number, number]>([0, 1]);

  const next = useCallback(() => setSlide(([i]) => [(i + 1) % count, 1]), [count]);
  const prev = useCallback(() => setSlide(([i]) => [(i - 1 + count) % count, -1]), [count]);
  const goTo = useCallback((to: number) => setSlide(([i]) => [to, to >= i ? 1 : -1]), []);

  if (count === 0) return null;
  const safe = index % count;

  function onDragEnd(_: PointerEvent | MouseEvent | TouchEvent, info: PanInfo) {
    if (info.offset.x < -SWIPE_DISTANCE || info.velocity.x < -SWIPE_VELOCITY) next();
    else if (info.offset.x > SWIPE_DISTANCE || info.velocity.x > SWIPE_VELOCITY) prev();
  }

  return (
    <section
      ref={rootRef}
      aria-roledescription={multiple ? "carousel" : undefined}
      aria-label="Leadership"
      className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8"
      onKeyDown={(e) => {
        if (!multiple) return;
        if (e.key === "ArrowRight") next();
        if (e.key === "ArrowLeft") prev();
      }}
    >
      <motion.div initial={{ opacity: 0, y: reduce ? 0 : 24 }} animate={shown ? { opacity: 1, y: 0 } : undefined} transition={{ duration: 0.8, ease: EASE }}>
        <div className="grid">
          <AnimatePresence initial={false} custom={dir} mode="sync">
            <motion.div
              key={leaders[safe].id}
              custom={dir}
              variants={reduce ? calmVariants : slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              drag={multiple ? "x" : false}
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.18}
              dragMomentum={false}
              onDragEnd={onDragEnd}
              style={{ touchAction: multiple ? "pan-y" : "auto", gridArea: "1 / 1" }}
              aria-roledescription={multiple ? "slide" : undefined}
              aria-label={multiple ? `${safe + 1} of ${count}: ${leaders[safe].name}` : undefined}
            >
              <Leader leader={leaders[safe]} first={safe === 0} />
            </motion.div>
          </AnimatePresence>
        </div>

        {multiple && (
          <div className="mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-brand-line pt-6">
            <div className="flex w-full min-w-0 items-center gap-2 overflow-x-auto py-1 sm:w-auto sm:flex-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden" role="group" aria-label="Choose a leader">
              {leaders.map((l, i) => {
                const active = i === safe;
                return (
                  <button
                    key={l.id}
                    type="button"
                    onClick={() => goTo(i)}
                    aria-label={`Show ${l.name}, ${l.title}`}
                    aria-current={active ? "true" : undefined}
                    className={`group flex flex-none items-center gap-3 rounded-full py-1.5 pl-1.5 pr-4 text-left transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold ${
                      active ? "bg-brand-gold/15 ring-1 ring-brand-gold/50" : "ring-1 ring-brand-line hover:ring-brand-gold/40"
                    }`}
                  >
                    <span className={`relative h-10 w-10 flex-none overflow-hidden rounded-full bg-brand-paper ring-2 transition-colors ${active ? "ring-brand-gold" : "ring-transparent"}`}>
                      <Image src={l.photo} alt="" fill sizes="40px" unoptimized={isServedImage(l.photo)} className="object-cover" />
                    </span>
                    <span className="hidden min-w-0 sm:block">
                      <span className="block truncate text-sm font-semibold text-heading">{l.name.split(" ").slice(0, 2).join(" ")}</span>
                      <span className="block truncate text-[11px] text-brand-ink/55">{l.title}</span>
                    </span>
                  </button>
                );
              })}
            </div>

            {/* A navigator of its own: a dark capsule with a ghost "back" arrow, a flipping counter and a gold "next" key that previews who comes next. */}
            <div className="flex flex-none items-center gap-1.5 rounded-full bg-[#0b0d24] p-1.5 shadow-[0_18px_40px_-16px_rgba(13,16,49,0.75)] ring-1 ring-brand-gold/30 dark:bg-black/70 dark:ring-brand-gold/40">
              <button
                type="button"
                onClick={prev}
                aria-label={`Previous: ${leaders[(safe - 1 + count) % count].name}`}
                className="group relative flex h-11 w-11 flex-none items-center justify-center overflow-hidden rounded-full text-brand-gold-soft transition-colors duration-300 hover:text-[#0b0d24] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold"
              >
                <span aria-hidden="true" className="absolute inset-0 scale-0 rounded-full bg-gradient-to-br from-brand-gold-soft to-brand-gold transition-transform duration-500 ease-out group-hover:scale-100" />
                <span className="relative block h-5 w-5 overflow-hidden">
                  <ArrowLeft size={20} strokeWidth={2} className="absolute inset-0 transition-transform duration-300 ease-out group-hover:-translate-x-6" />
                  <ArrowLeft size={20} strokeWidth={2} className="absolute inset-0 translate-x-6 transition-transform duration-300 ease-out group-hover:translate-x-0" />
                </span>
              </button>

              <span className="relative flex h-11 w-16 flex-none items-center justify-center overflow-hidden text-sm font-semibold tabular-nums text-white/90" aria-hidden="true">
                <AnimatePresence initial={false} mode="popLayout" custom={dir}>
                  <motion.span
                    key={safe}
                    custom={dir}
                    initial={{ y: reduce ? 0 : dir * 18, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: reduce ? 0 : dir * -18, opacity: 0 }}
                    transition={{ duration: 0.35, ease: EASE }}
                    className="absolute"
                  >
                    {String(safe + 1).padStart(2, "0")}
                  </motion.span>
                </AnimatePresence>
                <span className="absolute right-1.5 text-[10px] font-medium text-white/35">/{String(count).padStart(2, "0")}</span>
              </span>

              <button
                type="button"
                onClick={next}
                aria-label={`Next: ${leaders[(safe + 1) % count].name}`}
                className="group relative flex h-11 flex-none items-center gap-2.5 overflow-hidden rounded-full bg-gradient-to-r from-brand-gold-soft via-brand-gold to-[#c9b92f] pl-1.5 pr-4 text-[#0b0d24] shadow-[0_0_0_0_rgba(219,204,59,0.5)] transition-shadow duration-500 hover:shadow-[0_0_28px_2px_rgba(219,204,59,0.55)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
              >
                <span aria-hidden="true" className="pointer-events-none absolute inset-y-0 -left-1/2 w-1/3 -skew-x-12 bg-white/45 opacity-0 blur-[2px] transition-all duration-700 ease-out group-hover:left-[130%] group-hover:opacity-100" />
                <span className="relative h-8 w-8 flex-none overflow-hidden rounded-full ring-2 ring-[#0b0d24]/80">
                  <AnimatePresence initial={false} mode="popLayout">
                    <motion.span
                      key={leaders[(safe + 1) % count].id}
                      initial={{ scale: reduce ? 1 : 1.4, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.4, ease: EASE }}
                      className="absolute inset-0"
                    >
                      <Image src={leaders[(safe + 1) % count].photo} alt="" fill sizes="32px" unoptimized={isServedImage(leaders[(safe + 1) % count].photo)} className="object-cover" />
                    </motion.span>
                  </AnimatePresence>
                </span>
                <span className="relative text-sm font-semibold">Next</span>
                <span className="relative block h-5 w-5 overflow-hidden">
                  <ArrowRight size={20} strokeWidth={2.25} className="absolute inset-0 transition-transform duration-300 ease-out group-hover:translate-x-6" />
                  <ArrowRight size={20} strokeWidth={2.25} className="absolute inset-0 -translate-x-6 transition-transform duration-300 ease-out group-hover:translate-x-0" />
                </span>
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </section>
  );
}
