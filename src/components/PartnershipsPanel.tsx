"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { developerPartners } from "@/lib/content";
import MaskWords from "@/components/MaskWords";

const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * "Registered with the following developers", kept light: a short heading and one slim row of
 * small marks that rise in left to right. Pointing at a mark lifts it and shows the developer's
 * name beneath; the partner count ticks up at the end of the row.
 */
export default function PartnershipsPanel() {
  const reduce = useReducedMotion() ?? false;
  const ref = useRef<HTMLDivElement>(null);
  const show = useInView(ref, { once: true, amount: 0.4 });
  const total = developerPartners.length;
  const [n, setN] = useState(reduce ? total : 0);

  useEffect(() => {
    if (!show || reduce) return;
    let raf = 0;
    const t0 = performance.now() + 600;
    const tick = (now: number) => {
      const k = Math.max(0, Math.min(1, (now - t0) / 1100));
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
          <span className="text-sm font-semibold uppercase tracking-[0.2em] text-gold-ink">Trusted Partnerships</span>
          <motion.span initial={{ scaleX: 0 }} animate={show ? { scaleX: 1 } : undefined} transition={{ duration: 0.8, ease: EASE }} style={{ transformOrigin: "left" }} className="h-px w-8 bg-brand-gold" />
        </div>
        <MaskWords text="Registered with the following developers" show={show} delay={0.1} className="mx-auto mt-3 max-w-2xl text-2xl font-semibold tracking-tight text-heading sm:text-3xl" />
        <motion.p initial={{ opacity: 0, y: reduce ? 0 : 12 }} animate={show ? { opacity: 1, y: 0 } : undefined} transition={{ duration: 0.9, delay: 0.5, ease: EASE }} className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-brand-ink/70">
          Our registrations span Dubai&apos;s leading master developers.
        </motion.p>
      </div>

      <ul className="mx-auto mt-8 grid max-w-4xl grid-cols-3 gap-3 sm:grid-cols-5 lg:grid-cols-9">
        {developerPartners.map((p, i) => (
          <motion.li
            key={p.name}
            initial={{ opacity: 0, y: reduce ? 0 : 16 }}
            animate={show ? { opacity: 1, y: 0 } : undefined}
            transition={{ duration: 0.7, delay: 0.45 + i * 0.06, ease: EASE }}
            className="group relative"
          >
            <div className="flex aspect-[3/2] items-center justify-center rounded-xl border border-brand-line bg-white p-2.5 transition-all duration-300 group-hover:-translate-y-1 group-hover:border-brand-gold/60 group-hover:shadow-[0_14px_28px_-14px_rgba(219,204,59,0.55)] dark:border-white/10">
              <Image src={p.logo} alt={p.name} width={120} height={56} className="h-full w-full object-contain" />
            </div>
            <span className="pointer-events-none absolute left-1/2 top-full z-10 mt-1.5 -translate-x-1/2 whitespace-nowrap rounded-full bg-brand-navy px-2.5 py-1 text-[10px] font-semibold text-white opacity-0 shadow-lg transition-all duration-200 group-hover:translate-y-0.5 group-hover:opacity-100">
              {p.name}
            </span>
          </motion.li>
        ))}
      </ul>
      <p className="mt-6 text-center text-xs text-brand-ink/72">
        <span className="text-sm font-semibold tabular-nums text-gold-ink">{n}</span> registered developer partnerships across Dubai
      </p>
    </div>
  );
}
