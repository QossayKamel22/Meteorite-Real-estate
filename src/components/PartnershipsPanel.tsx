"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { developerPartners } from "@/lib/content";
import LogoMarquee from "@/components/LogoMarquee";
import MaskWords from "@/components/MaskWords";

const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * "Registered with the following developers": the heading rises word by word, the panel
 * opens like a curtain, the developer marks drift past on two rows going opposite ways, and
 * the partner count ticks up underneath.
 */
export default function PartnershipsPanel() {
  const reduce = useReducedMotion() ?? false;
  const ref = useRef<HTMLDivElement>(null);
  const show = useInView(ref, { once: true, amount: 0.3 });
  const total = developerPartners.length;
  const [n, setN] = useState(reduce ? total : 0);

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
        initial={{ clipPath: reduce ? "inset(0 0 0 0 round 1.5rem)" : "inset(0 50% 0 50% round 1.5rem)", opacity: 0 }}
        animate={show ? { clipPath: "inset(0 0% 0 0% round 1.5rem)", opacity: 1 } : undefined}
        transition={{ duration: reduce ? 0 : 1.2, delay: 0.3, ease: EASE }}
        className="relative mt-10 overflow-hidden rounded-3xl border border-brand-gold/20 bg-gradient-to-b from-surface to-brand-paper py-8 shadow-[0_20px_60px_-30px_rgba(219,204,59,0.5)]"
      >
        <div className="pointer-events-none absolute left-1/2 top-0 h-40 w-2/3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-gold/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-10 -right-10 h-40 w-40 rounded-full bg-brand-gold/10 blur-3xl" />
        <LogoMarquee />
        <p className="relative mt-5 text-center text-xs text-brand-ink/45">
          <span className="text-sm font-semibold tabular-nums text-brand-gold">{n}</span> registered developer partnerships across Dubai
        </p>
      </motion.div>
    </div>
  );
}
