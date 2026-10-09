"use client";

import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";
import type { Testimonial } from "@/lib/testimonials-data";
import ReviewAvatar from "@/components/ReviewAvatar";
import GoogleMark from "@/components/GoogleMark";

const INTERVAL_MS = 5500;

/**
 * The hero's rotating review card. Every review — existing and future — gets
 * the same treatment automatically: monogram avatar, real star rating, a
 * three-line excerpt, Google mark when it came from Google. On phones it sits
 * in the flow under the stats panel; from `sm` up it floats over the corner.
 */
export default function HeroReviews({ testimonials }: { testimonials: Testimonial[] }) {
  const reduceMotion = useReducedMotion();
  const count = testimonials.length;
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  const go = useCallback((delta: number) => setIndex((i) => (i + delta + count) % count), [count]);

  useEffect(() => {
    if (reduceMotion || paused || count < 2) return;
    const timer = window.setInterval(() => setIndex((i) => (i + 1) % count), INTERVAL_MS);
    return () => window.clearInterval(timer);
  }, [reduceMotion, paused, count, index]);

  if (count === 0) return null;
  const t = testimonials[index % count];
  const rating = Math.max(0, Math.min(5, Math.round(t.rating ?? 5)));
  const slide = reduceMotion ? 0 : 12;

  return (
    <motion.section
      aria-roledescription="carousel"
      aria-label="Client reviews"
      initial={{ opacity: 0, y: reduceMotion ? 0 : 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.55, ease: [0.22, 1, 0.36, 1] }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
      className={`glass glass-dark shimmer-border relative z-10 mt-5 w-full rounded-2xl p-4 sm:absolute sm:-bottom-8 sm:-left-6 sm:mt-0 sm:w-[19.5rem] ${reduceMotion ? "" : "sm:float-y"}`}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={t.id}
          initial={{ opacity: 0, x: slide }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -slide }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          aria-live={paused ? "polite" : "off"}
        >
          <div className="flex items-center gap-3">
            <ReviewAvatar name={t.name} size="md" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-[13px] font-semibold leading-tight text-white">{t.name}</p>
              <p className="mt-0.5 truncate text-[11px] leading-tight text-white/50">{t.role}</p>
            </div>
            {t.source === "google" && (
              <span className="inline-flex flex-none items-center gap-1.5 rounded-full bg-white/10 px-2 py-1 text-[10px] font-medium text-white/70 ring-1 ring-white/10">
                <GoogleMark />
                Google
              </span>
            )}
          </div>

          <div className="mt-3 flex items-center gap-0.5 text-brand-gold" role="img" aria-label={`${rating} out of 5 stars`}>
            {[1, 2, 3, 4, 5].map((n) => (
              <Star key={n} size={12} fill={n <= rating ? "currentColor" : "none"} strokeWidth={n <= rating ? 0 : 1.5} />
            ))}
          </div>

          <p className="mt-2 line-clamp-3 text-[13px] leading-relaxed text-white/85">&ldquo;{t.quote}&rdquo;</p>
        </motion.div>
      </AnimatePresence>

      {count > 1 && (
        <div className="mt-3 flex items-center justify-between border-t border-white/10 pt-2.5">
          <span className="text-[11px] font-medium tabular-nums text-white/40">
            {(index % count) + 1} / {count}
          </span>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => go(-1)}
              aria-label="Previous review"
              className="flex h-8 w-8 items-center justify-center rounded-full text-white/60 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              type="button"
              onClick={() => go(1)}
              aria-label="Next review"
              className="flex h-8 w-8 items-center justify-center rounded-full text-white/60 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </motion.section>
  );
}
