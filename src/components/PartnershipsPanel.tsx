"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion, useInView, useReducedMotion } from "framer-motion";
import { BadgeCheck } from "lucide-react";
import { developerPartners } from "@/lib/content";
import MaskWords from "@/components/MaskWords";

const EASE = [0.22, 1, 0.36, 1] as const;
const CYCLE_MS = 3200;

/**
 * "Registered with the following developers": a spotlight that moves through the partners
 * one at a time (logo, name, position in the list, a progress line), beside a grid of all of
 * them. Pointing at a mark puts it in the spotlight and pauses the tour; the partner count
 * ticks up in the corner. Reduced-motion visitors get the grid and a still spotlight.
 */
export default function PartnershipsPanel() {
  const reduce = useReducedMotion() ?? false;
  const ref = useRef<HTMLDivElement>(null);
  const show = useInView(ref, { once: true, amount: 0.3 });
  const partners = developerPartners;
  const total = partners.length;
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [n, setN] = useState(reduce ? total : 0);

  useEffect(() => {
    if (!show || reduce || paused) return;
    const t = window.setTimeout(() => setActive((a) => (a + 1) % total), CYCLE_MS);
    return () => window.clearTimeout(t);
  }, [show, reduce, paused, active, total]);

  useEffect(() => {
    if (!show || reduce) return;
    let raf = 0;
    const t0 = performance.now() + 700;
    const tick = (now: number) => {
      const k = Math.max(0, Math.min(1, (now - t0) / 1200));
      setN(Math.round(total * (1 - Math.pow(1 - k, 3))));
      if (k < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [show, reduce, total]);

  const current = partners[active];

  return (
    <div ref={ref}>
      <div className="text-center">
        <div className="flex items-center justify-center gap-2.5">
          <motion.span initial={{ scaleX: 0 }} animate={show ? { scaleX: 1 } : undefined} transition={{ duration: 0.8, ease: EASE }} style={{ transformOrigin: "right" }} className="h-px w-8 bg-brand-gold" />
          <span className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-gold">Trusted Partnerships</span>
          <motion.span initial={{ scaleX: 0 }} animate={show ? { scaleX: 1 } : undefined} transition={{ duration: 0.8, ease: EASE }} style={{ transformOrigin: "left" }} className="h-px w-8 bg-brand-gold" />
        </div>
        <MaskWords text="Registered with the following developers" show={show} delay={0.1} className="mx-auto mt-3 max-w-2xl text-3xl font-semibold tracking-tight text-heading sm:text-4xl" />
        <motion.p initial={{ opacity: 0, y: reduce ? 0 : 16 }} animate={show ? { opacity: 1, y: 0 } : undefined} transition={{ duration: 0.9, delay: 0.55, ease: EASE }} className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-brand-ink/60">
          Our registrations span Dubai&apos;s leading master developers — hover any mark for its name, or view our full certificate below.
        </motion.p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: reduce ? 0 : 40 }}
        animate={show ? { opacity: 1, y: 0 } : undefined}
        transition={{ duration: 1, delay: 0.3, ease: EASE }}
        onPointerEnter={() => setPaused(true)}
        onPointerLeave={() => setPaused(false)}
        className="relative mt-10 overflow-hidden rounded-[2rem] border border-brand-gold/20 bg-brand-navy shadow-[0_30px_70px_-34px_rgba(13,16,49,0.7)]"
      >
        <span aria-hidden="true" className="cta-aurora absolute inset-0" />
        <span aria-hidden="true" className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand-gold/70 to-transparent" />
        <span className="grain-overlay" />

        <div className="relative grid gap-6 p-5 sm:p-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-center lg:gap-10 lg:p-10">
          {/* the spotlight */}
          <div className="relative flex min-h-[15rem] flex-col items-center justify-center overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] px-6 py-8 text-center backdrop-blur-md">
            <span aria-hidden="true" className="pointer-events-none absolute left-1/2 top-1/2 h-48 w-48 -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-gold/15 blur-3xl" />
            <p className="relative text-[11px] font-semibold uppercase tracking-[0.24em] text-white/45">Registered developer partner</p>
            <div className="relative mt-5 flex h-24 w-56 items-center justify-center">
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={current.name}
                  initial={{ opacity: 0, y: reduce ? 0 : 18, scale: reduce ? 1 : 0.92, filter: reduce ? "none" : "blur(6px)" }}
                  animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
                  exit={{ opacity: 0, y: reduce ? 0 : -14, scale: reduce ? 1 : 1.04 }}
                  transition={{ duration: 0.55, ease: EASE }}
                  className="flex h-full w-full items-center justify-center rounded-2xl bg-white p-5 shadow-[0_18px_40px_-18px_rgba(0,0,0,0.6)]"
                >
                  <Image src={current.logo} alt={current.name} width={200} height={90} className="h-full w-full object-contain" />
                </motion.div>
              </AnimatePresence>
            </div>
            <AnimatePresence mode="wait" initial={false}>
              <motion.p key={current.name} initial={{ opacity: 0, y: reduce ? 0 : 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.4, ease: EASE }} className="relative mt-5 flex items-center gap-1.5 text-lg font-semibold text-white">
                <BadgeCheck size={17} className="text-brand-gold" /> {current.name}
              </motion.p>
            </AnimatePresence>
            <p className="relative mt-1 text-xs tabular-nums tracking-[0.2em] text-brand-gold">
              {String(active + 1).padStart(2, "0")} <span className="text-white/35">/ {String(total).padStart(2, "0")}</span>
            </p>
            <span aria-hidden="true" className="absolute inset-x-8 bottom-4 h-px overflow-hidden rounded-full bg-white/10">
              {!reduce && (
                <span key={`${active}-${paused}`} className="partner-fill absolute inset-0 origin-left bg-brand-gold" style={{ animationDuration: `${CYCLE_MS}ms`, animationPlayState: paused ? "paused" : "running" }} />
              )}
            </span>
          </div>

          {/* every partner */}
          <div>
            <ul className="grid grid-cols-3 gap-3">
              {partners.map((p, i) => {
                const on = i === active;
                return (
                  <motion.li
                    key={p.name}
                    initial={{ opacity: 0, y: reduce ? 0 : 22, scale: reduce ? 1 : 0.92 }}
                    animate={show ? { opacity: 1, y: 0, scale: 1 } : undefined}
                    transition={{ duration: 0.8, delay: 0.5 + i * 0.07, ease: EASE }}
                  >
                    <button
                      type="button"
                      onClick={() => setActive(i)}
                      onPointerEnter={() => setActive(i)}
                      onFocus={() => setActive(i)}
                      aria-label={p.name}
                      aria-current={on ? "true" : undefined}
                      className={`group relative flex aspect-[3/2] w-full items-center justify-center overflow-hidden rounded-2xl bg-white p-3.5 transition-all duration-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold sm:p-4 ${on ? "scale-[1.04] opacity-100 ring-2 ring-brand-gold shadow-[0_16px_40px_-14px_rgba(219,204,59,0.7)]" : "opacity-85 hover:opacity-100"}`}
                    >
                      <Image src={p.logo} alt="" width={140} height={64} className="h-full w-full object-contain" />
                    </button>
                  </motion.li>
                );
              })}
            </ul>
            <p className="mt-5 text-center text-xs text-white/55 lg:text-left">
              <span className="text-base font-semibold tabular-nums text-brand-gold">{n}</span> registered developer partnerships across Dubai
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
