"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { animate, motion, useInView, useReducedMotion } from "framer-motion";
import { Eye, IdCard, ShieldCheck, TrendingUp, UserX, Users, type LucideIcon } from "lucide-react";

const ICONS: Record<string, LucideIcon> = { eye: Eye, trend: TrendingUp, users: Users, shield: ShieldCheck, disabled: UserX, team: IdCard };

const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * A dashboard figure: the card rises in, the number counts up to its value, the icon sits in
 * a gold ring that glows on hover, and a thin line draws along the bottom edge.
 */
export default function AdminStatCard({ icon, label, value, href, index = 0 }: { icon: keyof typeof ICONS; label: string; value: number | string; href: string; index?: number }) {
  const Icon = ICONS[icon];
  const reduce = useReducedMotion() ?? false;
  const ref = useRef<HTMLAnchorElement>(null);
  const show = useInView(ref, { once: true, amount: 0.4 });
  const target = typeof value === "number" ? value : null;
  const [n, setN] = useState(0);

  useEffect(() => {
    if (target === null || !show || reduce) return;
    const c = animate(0, target, { duration: 1.4, delay: 0.2 + index * 0.07, ease: EASE, onUpdate: (v) => setN(Math.round(v)) });
    return () => c.stop();
  }, [show, reduce, target, index]);

  return (
    <motion.div initial={{ opacity: 0, y: reduce ? 0 : 26 }} animate={show ? { opacity: 1, y: 0 } : undefined} transition={{ duration: 0.7, delay: index * 0.07, ease: EASE }}>
      <Link
        ref={ref}
        prefetch={false}
        href={href}
        className="glass shimmer-border group relative block overflow-hidden rounded-3xl p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_22px_44px_-24px_rgba(219,204,59,0.55)]"
      >
        <span className="relative flex h-10 w-10 items-center justify-center">
          <span aria-hidden="true" className="absolute inset-0 rounded-2xl bg-brand-gold/0 blur-md transition-colors duration-300 group-hover:bg-brand-gold/35" />
          <span className="relative flex h-10 w-10 items-center justify-center rounded-2xl bg-brand-gold/15 text-brand-gold ring-1 ring-brand-gold/25 transition-all duration-300 group-hover:bg-brand-gold group-hover:text-brand-navy">
            <Icon size={17} strokeWidth={1.8} />
          </span>
        </span>
        <p className="mt-4 text-3xl font-semibold tabular-nums tracking-tight text-heading">{target === null ? value : (show && !reduce ? n : target).toLocaleString("en-US")}</p>
        <p className="mt-0.5 text-sm text-brand-ink/55">{label}</p>
        <span aria-hidden="true" className="absolute inset-x-0 bottom-0 h-0.5 origin-left scale-x-0 bg-gradient-to-r from-brand-gold to-brand-gold-soft transition-transform duration-500 group-hover:scale-x-100" />
      </Link>
    </motion.div>
  );
}
