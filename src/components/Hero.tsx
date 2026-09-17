"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { stats } from "@/lib/content";

export default function Hero() {
  const reduceMotion = useReducedMotion();
  const rise = (delay: number) => ({
    initial: { opacity: 0, y: reduceMotion ? 0 : 18 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] as const },
  });

  return (
    <section className="relative overflow-hidden bg-brand-navy">
      <Image
        src="/brand/hero-dubai-skyline.jpg"
        alt="Dubai skyline at dusk"
        fill
        priority
        className="object-cover opacity-45"
        sizes="100vw"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-brand-navy via-brand-navy/75 to-brand-navy/40" />
      <div className="glow-field opacity-70" />

      <div className="relative mx-auto grid max-w-7xl gap-14 px-4 py-24 sm:px-6 sm:py-32 lg:grid-cols-[1.15fr_0.85fr] lg:items-center lg:px-8 lg:py-40">
        <div>
          <motion.p
            {...rise(0)}
            className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-gold"
          >
            Dubai Real Estate, Since 2005
          </motion.p>
          <motion.h1
            {...rise(0.08)}
            className="mt-5 max-w-2xl text-4xl font-semibold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl"
          >
            The best way to find your dream home.
          </motion.h1>
          <motion.p
            {...rise(0.16)}
            className="mt-5 max-w-xl text-lg leading-relaxed text-white/75"
          >
            We help you get the best deal — a RERA-certified brokerage guiding you through buying,
            selling, leasing and property management across the UAE.
          </motion.p>

          <motion.div {...rise(0.24)} className="mt-10 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/for-sale"
              className="rounded-full bg-brand-gold px-7 py-3.5 text-center text-[15px] font-semibold text-brand-navy shadow-[0_8px_24px_-8px_rgba(219,204,59,0.6)] transition-transform duration-200 hover:scale-[1.03]"
            >
              Browse properties for sale
            </Link>
            <Link
              href="/for-rent"
              className="glass rounded-full px-7 py-3.5 text-center text-[15px] font-semibold text-white transition-transform duration-200 hover:scale-[1.03]"
            >
              Browse properties for rent
            </Link>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: reduceMotion ? 0 : 24, scale: reduceMotion ? 1 : 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="glass shimmer-border rounded-3xl p-7 sm:p-8"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-navy/60">
            At a glance
          </p>
          <dl className="mt-5 grid grid-cols-2 gap-x-6 gap-y-6">
            {stats.slice(0, 2).map((stat) => (
              <div key={stat.label}>
                <dt className="text-sm text-brand-navy/60">{stat.label}</dt>
                <dd className="mt-1 text-2xl font-semibold tracking-tight text-brand-navy">
                  {stat.value}+
                </dd>
              </div>
            ))}
          </dl>
        </motion.div>
      </div>
    </section>
  );
}
