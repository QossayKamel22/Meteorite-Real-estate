"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowUpRight, Clapperboard, Image as ImageIcon, LayoutTemplate, Sparkles } from "lucide-react";
import MaskWords from "@/components/MaskWords";

const EASE = [0.22, 1, 0.36, 1] as const;

const SHORTCUTS = [
  { href: "/admin/media", label: "New media post", Icon: ImageIcon },
  { href: "/admin/reels", label: "Add a reel", Icon: Clapperboard },
  { href: "/admin/homepage", label: "Edit the homepage", Icon: LayoutTemplate },
];

function greeting(): string {
  const h = new Date().getHours();
  return h < 5 ? "Working late" : h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening";
}

/**
 * The top of the admin overview: a navy banner with a slowly moving gold light, a greeting for
 * the time of day, today's date, and shortcuts to the three things edited most.
 */
export default function AdminWelcome() {
  const reduce = useReducedMotion() ?? false;
  const date = new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" });

  return (
    <section className="relative isolate overflow-hidden bg-brand-navy py-10 sm:py-12">
      <span aria-hidden="true" className="cta-aurora absolute inset-0 -z-10" />
      <span aria-hidden="true" className="obsidian-lattice absolute inset-0 -z-10 opacity-[0.05]" />
      <div className="grain-overlay" />
      <span aria-hidden="true" className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-brand-gold/50 to-transparent" />
      <div className="relative mx-auto flex max-w-6xl flex-col gap-6 px-4 sm:px-6 lg:flex-row lg:items-end lg:justify-between lg:px-8">
        <div>
          <motion.p initial={{ opacity: 0, y: reduce ? 0 : 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: EASE }} className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-brand-gold">
            <span className="relative flex h-2 w-2" aria-hidden="true">
              {!reduce && <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-70" />}
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
            </span>
            Admin · {date}
          </motion.p>
          <MaskWords as="h1" text={`${greeting()}, welcome back`} show delay={0.1} className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl" />
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.9, delay: 0.6 }} className="mt-2 flex items-center gap-1.5 text-sm text-white/55">
            <Sparkles size={14} className="text-brand-gold" /> Here is how the site is doing.
          </motion.p>
        </div>
        <ul className="flex flex-wrap gap-2.5">
          {SHORTCUTS.map(({ href, label, Icon }, i) => (
            <motion.li key={href} initial={{ opacity: 0, y: reduce ? 0 : 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.5 + i * 0.1, ease: EASE }}>
              <Link prefetch={false} href={href} className="group flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.07] px-4 py-2 text-sm font-medium text-white/85 backdrop-blur transition-all duration-300 hover:-translate-y-0.5 hover:border-brand-gold/60 hover:bg-brand-gold hover:text-brand-navy">
                <Icon size={15} className="text-brand-gold transition-colors group-hover:text-brand-navy" />
                {label}
                <ArrowUpRight size={13} className="opacity-50 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </Link>
            </motion.li>
          ))}
        </ul>
      </div>
    </section>
  );
}
