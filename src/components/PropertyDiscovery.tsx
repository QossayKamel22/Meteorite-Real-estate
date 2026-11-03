"use client";

import { useRef } from "react";
import Link from "next/link";
import { motion, useInView, useMotionValue, useReducedMotion, useSpring, useTransform } from "framer-motion";
import { ArrowUpRight, Building2, Home, Store, Warehouse } from "lucide-react";
import { externalListings } from "@/lib/content";
import MaskWords from "@/components/MaskWords";

const EASE = [0.22, 1, 0.36, 1] as const;

const categories = [
  { label: "Apartments & Studios", blurb: "From studios to family flats", icon: Building2, forSale: `${externalListings.bayutForSale}&category=apartment`, forRent: `${externalListings.bayutForRent}&category=apartment` },
  { label: "Villas", blurb: "Space, gardens, privacy", icon: Home, forSale: `${externalListings.bayutForSale}&category=villa`, forRent: `${externalListings.bayutForRent}&category=villa` },
  { label: "Townhouses", blurb: "Community living, your own door", icon: Warehouse, forSale: `${externalListings.bayutForSale}&category=townhouse`, forRent: `${externalListings.bayutForRent}&category=townhouse` },
  { label: "Commercial", blurb: "Offices, shops and more", icon: Store, forSale: `${externalListings.bayutForSale}&category=commercial`, forRent: `${externalListings.bayutForRent}&category=commercial` },
];

/** A category tile that leans toward the pointer, follows it with a gold glow, and spins a dashed ring round its icon. */
function Tile({ cat, index, show, still }: { cat: (typeof categories)[number]; index: number; show: boolean; still: boolean }) {
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const rx = useSpring(useTransform(py, [-0.5, 0.5], [5, -5]), { stiffness: 200, damping: 20 });
  const ry = useSpring(useTransform(px, [-0.5, 0.5], [-6, 6]), { stiffness: 200, damping: 20 });
  const Icon = cat.icon;

  return (
    <motion.li
      initial={{ opacity: 0, y: still ? 0 : 40, scale: still ? 1 : 0.94 }}
      animate={show ? { opacity: 1, y: 0, scale: 1 } : undefined}
      transition={{ duration: 0.9, delay: 0.25 + index * 0.1, ease: EASE }}
      className="[perspective:800px]"
    >
      <motion.div
        onPointerMove={(e) => {
          if (still) return;
          const r = e.currentTarget.getBoundingClientRect();
          px.set((e.clientX - r.left) / r.width - 0.5);
          py.set((e.clientY - r.top) / r.height - 0.5);
          e.currentTarget.style.setProperty("--mx", `${e.clientX - r.left}px`);
          e.currentTarget.style.setProperty("--my", `${e.clientY - r.top}px`);
        }}
        onPointerLeave={() => {
          px.set(0);
          py.set(0);
        }}
        style={still ? undefined : { rotateX: rx, rotateY: ry, transformStyle: "preserve-3d" }}
        className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-brand-line bg-surface p-5 transition-[border-color,box-shadow] duration-300 hover:border-brand-gold/60 hover:shadow-[0_22px_44px_-24px_rgba(219,204,59,0.65)]"
      >
        <span aria-hidden="true" className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100" style={{ background: "radial-gradient(220px circle at var(--mx, 50%) var(--my, 0%), rgba(219,204,59,0.16), transparent 65%)" }} />
        <span aria-hidden="true" className="absolute inset-x-0 top-0 h-0.5 origin-left scale-x-0 bg-gradient-to-r from-brand-gold to-brand-gold-soft transition-transform duration-500 group-hover:scale-x-100" />

        <div className="relative flex items-center gap-3.5">
          <span className="relative flex h-11 w-11 flex-none items-center justify-center">
            <svg viewBox="0 0 44 44" aria-hidden="true" className="tile-ring absolute inset-0 h-full w-full text-brand-gold/0 transition-colors duration-300 group-hover:text-brand-gold">
              <circle cx="22" cy="22" r="20.5" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="3 5" />
            </svg>
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-gold/15 text-gold-ink transition-all duration-300 group-hover:scale-105 group-hover:bg-brand-gold group-hover:text-brand-navy">
              <Icon size={17} strokeWidth={1.8} />
            </span>
          </span>
          <div className="min-w-0">
            <h3 className="text-base font-semibold leading-tight text-heading">{cat.label}</h3>
            <p className="mt-0.5 truncate text-xs text-brand-ink/65">{cat.blurb}</p>
          </div>
        </div>

        <div className="relative mt-5 grid grid-cols-2 gap-2 text-sm font-medium">
          <a href={cat.forSale} target="_blank" rel="noopener noreferrer" className="group/p flex items-center justify-center gap-1 rounded-full bg-brand-navy px-3 py-2 text-white transition-colors hover:bg-brand-navy-light dark:bg-white/10 dark:hover:bg-white/20">
            For sale <ArrowUpRight size={13} className="transition-transform duration-300 group-hover/p:-translate-y-0.5 group-hover/p:translate-x-0.5" />
          </a>
          <a href={cat.forRent} target="_blank" rel="noopener noreferrer" className="group/p flex items-center justify-center gap-1 rounded-full border border-brand-line px-3 py-2 text-heading transition-colors hover:border-brand-gold hover:text-brand-gold">
            For rent <ArrowUpRight size={13} className="transition-transform duration-300 group-hover/p:-translate-y-0.5 group-hover/p:translate-x-0.5" />
          </a>
        </div>
      </motion.div>
    </motion.li>
  );
}

/**
 * "Explore our current listings": a pulsing LIVE marker, a headline that rises word by word,
 * and four category tiles that arrive in turn and lean toward the pointer. The agency-profile
 * button drifts a little toward the cursor.
 */
export default function PropertyDiscovery() {
  const reduce = useReducedMotion() ?? false;
  const ref = useRef<HTMLElement>(null);
  const show = useInView(ref, { once: true, amount: 0.25 });
  const mx = useSpring(useMotionValue(0), { stiffness: 220, damping: 18 });
  const my = useSpring(useMotionValue(0), { stiffness: 220, damping: 18 });

  return (
    <section ref={ref} className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-16 lg:px-8">
      <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div className="max-w-xl">
          <div className="flex items-center gap-2.5">
            <motion.span initial={{ scaleX: 0 }} animate={show ? { scaleX: 1 } : undefined} transition={{ duration: 0.8, ease: EASE }} style={{ transformOrigin: "left" }} className="h-px w-8 bg-brand-gold" />
            <span className="relative flex h-2 w-2" aria-hidden="true">
              {!reduce && <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-70" />}
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
            </span>
            <span className="text-sm font-semibold uppercase tracking-[0.2em] text-gold-ink">Live Inventory</span>
          </div>
          <MaskWords text="Explore our current listings" show={show} delay={0.1} className="mt-3 text-3xl font-semibold tracking-tight text-heading sm:text-4xl" />
          <motion.p initial={{ opacity: 0, y: reduce ? 0 : 16 }} animate={show ? { opacity: 1, y: 0 } : undefined} transition={{ duration: 0.9, delay: 0.5, ease: EASE }} className="mt-3 text-[15px] leading-relaxed text-brand-ink/60">
            Our full, always-current portfolio lives on Bayut, our verified listing partner. Pick a category, or open our agency profile.
          </motion.p>
        </div>
        <motion.div
          initial={{ opacity: 0, x: reduce ? 0 : 24 }}
          animate={show ? { opacity: 1, x: 0 } : undefined}
          transition={{ duration: 0.9, delay: 0.4, ease: EASE }}
          onPointerMove={(e) => {
            if (reduce) return;
            const r = e.currentTarget.getBoundingClientRect();
            mx.set(((e.clientX - r.left) / r.width - 0.5) * 14);
            my.set(((e.clientY - r.top) / r.height - 0.5) * 10);
          }}
          onPointerLeave={() => {
            mx.set(0);
            my.set(0);
          }}
          className="self-start sm:self-auto"
        >
          <motion.a
            style={reduce ? undefined : { x: mx, y: my }}
            href={externalListings.bayutCompanyForSale}
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center gap-2 whitespace-nowrap rounded-full border border-brand-gold/50 px-5 py-2.5 text-sm font-semibold text-heading transition-colors duration-300 hover:bg-brand-gold hover:text-brand-navy"
          >
            Agency profile
            <ArrowUpRight size={15} className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </motion.a>
        </motion.div>
      </div>

      <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {categories.map((cat, i) => (
          <Tile key={cat.label} cat={cat} index={i} show={show} still={reduce} />
        ))}
      </ul>

      <motion.div initial={{ opacity: 0 }} animate={show ? { opacity: 1 } : undefined} transition={{ duration: 0.8, delay: 0.9 }} className="mt-5 flex flex-col gap-2 text-xs text-brand-ink/62 sm:flex-row sm:items-center sm:justify-between">
        <p>Links open Bayut in a new tab. Prices and availability are managed live there.</p>
        <Link prefetch={false} href="/for-sale" className="group text-sm font-semibold text-heading transition-colors hover:text-brand-gold">
          More about buying with Meteorite <span aria-hidden="true" className="inline-block transition-transform duration-300 group-hover:translate-x-1">→</span>
        </Link>
      </motion.div>
    </section>
  );
}
