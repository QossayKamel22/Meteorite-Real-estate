"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { Star } from "lucide-react";
import GoogleMark from "@/components/GoogleMark";

/** The Google rating card: the score counts up, the stars light one by one, the review total follows. */
export default function GoogleRatingBadge({ rating, count, url }: { rating: number; count: number; url: string }) {
  const reduce = useReducedMotion() ?? false;
  const ref = useRef<HTMLAnchorElement>(null);
  const show = useInView(ref, { once: true, amount: 0.6 });
  const [score, setScore] = useState(reduce ? rating : 0);
  const [total, setTotal] = useState(reduce ? count : 0);

  useEffect(() => {
    if (!show || reduce) return;
    const t0 = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const k = Math.min(1, (now - t0) / 1500);
      const e = 1 - Math.pow(1 - k, 3);
      setScore(rating * e);
      setTotal(Math.round(count * e));
      if (k < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [show, reduce, rating, count]);

  const lit = Math.round(rating);
  return (
    <a
      ref={ref}
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Google rating ${rating.toFixed(1)} from ${count} reviews`}
      className="group relative flex items-center gap-4 overflow-hidden rounded-2xl bg-white px-5 py-3.5 shadow-sm ring-1 ring-black/5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg dark:bg-white/[0.07] dark:shadow-none dark:ring-white/15 dark:hover:bg-white/[0.1]"
    >
      <span aria-hidden="true" className="pointer-events-none absolute inset-y-0 -left-1/2 w-1/3 -skew-x-12 bg-gradient-to-r from-transparent via-brand-gold/25 to-transparent opacity-0 transition-all duration-1000 group-hover:left-[130%] group-hover:opacity-100" />
      <p className="relative text-4xl font-semibold leading-none tracking-tight text-heading tabular-nums" aria-hidden="true">
        {score.toFixed(1)}
      </p>
      <div className="relative">
        <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-brand-ink/65">
          <GoogleMark />
          Google
        </p>
        <div className="mt-1 flex items-center gap-0.5" aria-hidden="true">
          {[1, 2, 3, 4, 5].map((n) => (
            <motion.span
              key={n}
              initial={{ opacity: reduce ? 1 : 0.2, scale: reduce ? 1 : 0.4 }}
              animate={show ? { opacity: 1, scale: 1 } : undefined}
              transition={{ type: "spring", stiffness: 300, damping: 14, delay: 0.25 + n * 0.12 }}
            >
              <Star size={14} className="text-brand-gold" fill={n <= lit ? "currentColor" : "none"} strokeWidth={1.5} />
            </motion.span>
          ))}
        </div>
        <p className="mt-0.5 text-xs tabular-nums text-brand-ink/65" aria-hidden="true">
          {total} review{count === 1 ? "" : "s"}
        </p>
      </div>
    </a>
  );
}
