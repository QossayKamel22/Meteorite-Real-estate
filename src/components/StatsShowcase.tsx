"use client";

import { useRef } from "react";
import { motion, useInView, useReducedMotion, useScroll, useTransform } from "framer-motion";
import MaskWords from "@/components/MaskWords";

const EASE = [0.22, 1, 0.36, 1] as const;
const DIGITS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

/** One digit as a little odometer: a column of 0-9 that rolls up to the value. */
function Digit({ d, show, delay, still }: { d: number; show: boolean; delay: number; still: boolean }) {
  return (
    <span className="relative inline-block h-[1em] overflow-hidden leading-none" aria-hidden="true">
      <motion.span
        className="flex flex-col"
        initial={{ y: still ? `${-d * 10}%` : "0%" }}
        animate={show ? { y: `${-d * 10}%` } : undefined}
        transition={{ duration: still ? 0 : 1.7, delay, ease: EASE }}
      >
        {DIGITS.map((n) => (
          <span key={n} className="block h-[1em] leading-none">
            {n}
          </span>
        ))}
      </motion.span>
    </span>
  );
}

function Stat({ value, label, index, show, still }: { value: number; label: string; index: number; show: boolean; still: boolean }) {
  const chars = value.toLocaleString("en-US").split("");
  const ring = 0.72 + ((index * 7) % 5) * 0.05;
  return (
    <motion.li
      initial={{ opacity: 0, y: still ? 0 : 36 }}
      animate={show ? { opacity: 1, y: 0 } : undefined}
      transition={{ duration: 0.9, delay: 0.15 + index * 0.12, ease: EASE }}
      className="group flex flex-col items-center px-2 text-center"
    >
      <div className="relative flex aspect-square w-full max-w-[10.5rem] items-center justify-center sm:max-w-[11.5rem]">
        <svg viewBox="0 0 100 100" className="absolute inset-0 -rotate-90" aria-hidden="true">
          <circle cx="50" cy="50" r="46" fill="none" strokeWidth="0.8" className="stroke-white/15" />
          <motion.circle
            cx="50"
            cy="50"
            r="46"
            fill="none"
            strokeWidth="1.6"
            strokeLinecap="round"
            className="stroke-brand-gold"
            initial={{ pathLength: still ? ring : 0 }}
            animate={show ? { pathLength: ring } : undefined}
            transition={{ duration: still ? 0 : 2.2, delay: 0.3 + index * 0.12, ease: EASE }}
          />
        </svg>
        {/* a slow orbiting spark, so the ring is never quite still */}
        {!still && (
          <span aria-hidden="true" className="stat-orbit absolute inset-0" style={{ animationDuration: `${14 + index * 3}s` }}>
            <span className="absolute left-1/2 top-[2%] h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-brand-gold-soft shadow-[0_0_12px_3px_rgba(233,221,122,0.7)]" />
          </span>
        )}
        <span aria-hidden="true" className="absolute inset-4 rounded-full bg-[radial-gradient(circle,rgba(219,204,59,0.14),transparent_70%)] opacity-70 transition-opacity duration-500 group-hover:opacity-100" />
        <p className="relative flex items-baseline text-[2.6rem] font-semibold leading-none tracking-tight text-white sm:text-[3.1rem]">
          <span className="sr-only">{value.toLocaleString("en-US")}+</span>
          {chars.map((c, i) =>
            /\d/.test(c) ? (
              <Digit key={i} d={Number(c)} show={show} delay={0.4 + index * 0.12 + i * 0.14} still={still} />
            ) : (
              <span key={i} aria-hidden="true">
                {c}
              </span>
            )
          )}
          <span aria-hidden="true" className="ml-0.5 text-[0.6em] font-medium text-brand-gold">
            +
          </span>
        </p>
      </div>
      <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.22em] text-white/60 transition-colors duration-300 group-hover:text-brand-gold-soft sm:text-xs">{label}</p>
    </motion.li>
  );
}

/**
 * "Numbers built over 20 years": a dark band where each figure is an odometer that rolls
 * up to its value inside a ring that draws itself, with a spark orbiting the ring and a
 * soft gold light that travels across the band as you scroll past it.
 */
export default function StatsShowcase({ stats }: { stats: { label: string; value: number }[] }) {
  const reduce = useReducedMotion() ?? false;
  const ref = useRef<HTMLElement>(null);
  const show = useInView(ref, { once: true, amount: 0.3 });
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const lightX = useTransform(scrollYProgress, [0, 1], ["-30%", "110%"]);

  return (
    <section ref={ref} id="stats" className="relative isolate overflow-hidden bg-brand-navy py-16 sm:py-20">
      <div aria-hidden="true" className="obsidian-lattice pointer-events-none absolute inset-0 -z-10 opacity-[0.06]" />
      <motion.div aria-hidden="true" style={reduce ? undefined : { left: lightX }} className="pointer-events-none absolute top-0 -z-10 h-full w-[40%] -translate-x-1/2 bg-[radial-gradient(closest-side,rgba(219,204,59,0.16),transparent)]" />
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand-gold/60 to-transparent" />
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-brand-gold/30 to-transparent" />

      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <div className="flex items-center justify-center gap-2.5">
            <motion.span initial={{ scaleX: 0 }} animate={show ? { scaleX: 1 } : undefined} transition={{ duration: 0.8, ease: EASE }} style={{ transformOrigin: "right" }} className="h-px w-8 bg-brand-gold" />
            <span className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-gold">Track Record</span>
            <motion.span initial={{ scaleX: 0 }} animate={show ? { scaleX: 1 } : undefined} transition={{ duration: 0.8, ease: EASE }} style={{ transformOrigin: "left" }} className="h-px w-8 bg-brand-gold" />
          </div>
          <MaskWords text="Numbers built over 20 years" show={show} delay={0.1} className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl" />
        </div>

        <ul className="mt-10 grid grid-cols-2 gap-x-4 gap-y-10 lg:grid-cols-4">
          {stats.map((s, i) => (
            <Stat key={s.label} value={s.value} label={s.label} index={i} show={show} still={reduce} />
          ))}
        </ul>
      </div>
    </section>
  );
}
