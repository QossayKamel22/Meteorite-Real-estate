"use client";

import { useRef } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { ArrowUpRight, Building2, Home, ShieldCheck } from "lucide-react";
import MaskWords from "@/components/MaskWords";

const EASE = [0.22, 1, 0.36, 1] as const;

/** The "see everything on Bayut" panel and the licence strip beneath it, both animated in on scroll. */
export default function BayutBanner({ href, forSale, credentials }: { href: string; forSale: boolean; credentials: string[] }) {
  const reduce = useReducedMotion() ?? false;
  const ref = useRef<HTMLDivElement>(null);
  const show = useInView(ref, { once: true, amount: 0.3 });
  const Icon = forSale ? Building2 : Home;

  return (
    <div ref={ref} className="mt-14">
      <motion.a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        initial={{ opacity: 0, y: reduce ? 0 : 44, scale: reduce ? 1 : 0.97 }}
        animate={show ? { opacity: 1, y: 0, scale: 1 } : undefined}
        transition={{ duration: 0.95, ease: EASE }}
        className="group relative isolate flex flex-col items-start gap-6 overflow-hidden rounded-[2rem] bg-brand-navy px-8 py-9 sm:flex-row sm:items-center sm:justify-between sm:px-12"
      >
        <span aria-hidden="true" className="cta-aurora absolute inset-0 -z-10" />
        <span className="grain-overlay" />
        <span aria-hidden="true" className="absolute inset-x-0 top-0 -z-10 h-px bg-gradient-to-r from-transparent via-brand-gold/70 to-transparent" />
        <div className="flex items-center gap-5">
          <span className="relative flex h-14 w-14 flex-none items-center justify-center">
            {!reduce && <span aria-hidden="true" className="pin-ripple absolute inset-0 rounded-full bg-brand-gold/40" />}
            <span className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-gold/15 text-brand-gold ring-1 ring-brand-gold/30 transition-colors duration-300 group-hover:bg-brand-gold group-hover:text-brand-navy">
              <Icon size={24} strokeWidth={1.75} />
            </span>
          </span>
          <div>
            <MaskWords as="p" text="Looking for more options?" show={show} delay={0.15} className="text-xl font-semibold tracking-tight text-white sm:text-2xl" />
            <motion.p initial={{ opacity: 0 }} animate={show ? { opacity: 1 } : undefined} transition={{ duration: 0.9, delay: 0.5 }} className="mt-1 max-w-md text-sm leading-relaxed text-white/65">
              Browse our complete, live inventory on Bayut, our verified listing partner.
            </motion.p>
          </div>
        </div>
        <span className="relative inline-flex flex-none items-center gap-1.5 overflow-hidden whitespace-nowrap rounded-full bg-brand-gold px-6 py-3 text-sm font-semibold text-brand-navy shadow-[0_8px_24px_-8px_rgba(219,204,59,0.6)] transition-all duration-300 group-hover:scale-[1.04] group-hover:shadow-[0_14px_40px_-8px_rgba(219,204,59,0.85)]">
          <span aria-hidden="true" className="pointer-events-none absolute inset-y-0 -left-1/2 w-1/3 -skew-x-12 bg-white/45 opacity-0 blur-[2px] transition-all duration-700 group-hover:left-[130%] group-hover:opacity-100" />
          <span className="relative">View all on Bayut</span>
          <ArrowUpRight size={15} className="relative transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
        </span>
      </motion.a>

      <ul className="glass shimmer-border mt-5 grid grid-cols-1 gap-4 rounded-3xl p-6 sm:grid-cols-3">
        {credentials.map((item, i) => (
          <motion.li
            key={item}
            initial={{ opacity: 0, y: reduce ? 0 : 18 }}
            animate={show ? { opacity: 1, y: 0 } : undefined}
            transition={{ duration: 0.8, delay: 0.5 + i * 0.12, ease: EASE }}
            className="flex items-center gap-3"
          >
            <motion.span
              initial={{ scale: reduce ? 1 : 0 }}
              animate={show ? { scale: 1 } : undefined}
              transition={{ type: "spring", stiffness: 260, damping: 14, delay: 0.6 + i * 0.12 }}
              className="flex h-8 w-8 flex-none items-center justify-center rounded-full bg-brand-gold/15 text-brand-gold"
            >
              <ShieldCheck size={14} />
            </motion.span>
            <span className="text-sm text-brand-ink/70">{item}</span>
          </motion.li>
        ))}
      </ul>
    </div>
  );
}
