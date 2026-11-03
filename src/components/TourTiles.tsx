"use client";

import { useRef } from "react";
import { motion, useInView, useMotionValue, useReducedMotion, useSpring, useTransform } from "framer-motion";
import { ArrowUpRight, Building2, Home, Play, Store, Warehouse, type LucideIcon } from "lucide-react";

const EASE = [0.22, 1, 0.36, 1] as const;
const ICONS: Record<string, LucideIcon> = { apartment: Building2, villa: Home, townhouse: Warehouse, commercial: Store };

export type Tour = { key: string; label: string; href: string };

function Tile({ tour, index, show, still }: { tour: Tour; index: number; show: boolean; still: boolean }) {
  const Icon = ICONS[tour.key] ?? Building2;
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const rx = useSpring(useTransform(py, [-0.5, 0.5], [6, -6]), { stiffness: 200, damping: 20 });
  const ry = useSpring(useTransform(px, [-0.5, 0.5], [-7, 7]), { stiffness: 200, damping: 20 });
  return (
    <motion.li
      initial={{ opacity: 0, y: still ? 0 : 50, scale: still ? 1 : 0.94 }}
      animate={show ? { opacity: 1, y: 0, scale: 1 } : undefined}
      transition={{ duration: 0.95, delay: 0.3 + index * 0.1, ease: EASE }}
      className="[perspective:800px]"
    >
      <motion.a
        href={tour.href}
        target="_blank"
        rel="noopener noreferrer"
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
        className="group relative flex h-full min-h-[11rem] flex-col justify-between overflow-hidden rounded-3xl border border-brand-line bg-surface p-6 transition-[border-color,box-shadow] duration-300 hover:border-brand-gold/60 hover:shadow-[0_26px_56px_-26px_rgba(219,204,59,0.6)]"
      >
        <span aria-hidden="true" className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100" style={{ background: "radial-gradient(240px circle at var(--mx, 50%) var(--my, 0%), rgba(219,204,59,0.18), transparent 65%)" }} />
        <Icon aria-hidden="true" strokeWidth={1} className="pointer-events-none absolute -bottom-6 -right-6 h-36 w-36 text-brand-gold/[0.07] transition-all duration-700 group-hover:-rotate-6 group-hover:scale-110 group-hover:text-gold-ink/[0.14]" />
        <span aria-hidden="true" className="absolute inset-x-0 top-0 h-0.5 origin-left scale-x-0 bg-gradient-to-r from-brand-gold to-brand-gold-soft transition-transform duration-500 group-hover:scale-x-100" />

        <span className="relative flex h-14 w-14 items-center justify-center">
          <span aria-hidden="true" className="pin-ripple absolute inset-1 rounded-full border border-brand-gold/60" />
          <span className="relative flex h-12 w-12 items-center justify-center rounded-full bg-brand-gold/15 text-brand-gold ring-1 ring-brand-gold/30 transition-colors duration-300 group-hover:bg-brand-gold group-hover:text-brand-navy">
            <Play size={18} fill="currentColor" className="ml-0.5" />
          </span>
        </span>
        <div className="relative mt-6">
          <h3 className="text-lg font-semibold leading-tight text-heading">{tour.label}</h3>
          <span className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-brand-ink/60 transition-colors group-hover:text-gold-ink">
            Watch tours <ArrowUpRight size={14} className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </span>
        </div>
      </motion.a>
    </motion.li>
  );
}

/** The video-tour categories as four tiles: each has a pulsing play button, a ghost icon that turns on hover, and leans toward the pointer. */
export default function TourTiles({ tours }: { tours: Tour[] }) {
  const reduce = useReducedMotion() ?? false;
  const ref = useRef<HTMLUListElement>(null);
  const show = useInView(ref, { once: true, amount: 0.25 });
  return (
    <ul ref={ref} className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {tours.map((t, i) => (
        <Tile key={t.key} tour={t} index={i} show={show} still={reduce} />
      ))}
    </ul>
  );
}
