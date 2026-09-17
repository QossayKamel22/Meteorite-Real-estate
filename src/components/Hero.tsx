"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ChevronDown, ShieldCheck, Star } from "lucide-react";
import { stats, ceo, testimonials } from "@/lib/content";
import Particles from "@/components/Particles";

export default function Hero() {
  const reduceMotion = useReducedMotion();
  const rise = (delay: number) => ({
    initial: { opacity: 0, y: reduceMotion ? 0 : 18 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] as const },
  });
  const featuredQuote = testimonials[0];

  return (
    <section className="relative overflow-hidden bg-brand-navy">
      <div className="absolute inset-0 overflow-hidden">
        <Image
          src="/brand/hero-dubai-skyline.jpg"
          alt="Dubai skyline at dusk"
          fill
          priority
          className={`object-cover opacity-45 ${reduceMotion ? "" : "ken-burns"}`}
          sizes="100vw"
        />
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-brand-navy via-brand-navy/75 to-brand-navy/40" />
      <div className="glow-field opacity-70" />
      <div className="grain-overlay" />
      <Particles />

      <div className="relative mx-auto grid max-w-7xl gap-14 px-4 py-24 sm:px-6 sm:py-32 lg:grid-cols-[1.15fr_0.85fr] lg:items-center lg:px-8 lg:py-40">
        <div>
          <motion.div {...rise(0)} className="glass glass-dark inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold text-white/85">
            <ShieldCheck size={14} className="text-brand-gold" />
            RERA-Certified · Trusted Since 2005
          </motion.div>
          <motion.h1
            {...rise(0.1)}
            className="mt-6 max-w-2xl text-4xl font-semibold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl"
          >
            The best way to find your dream home.
          </motion.h1>
          <motion.p
            {...rise(0.18)}
            className="mt-5 max-w-xl text-lg leading-relaxed text-white/75"
          >
            We help you get the best deal — a RERA-certified brokerage guiding you through buying,
            selling, leasing and property management across the UAE.
          </motion.p>

          <motion.div {...rise(0.26)} className="mt-10 flex flex-col gap-3 sm:flex-row">
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

          <motion.div {...rise(0.34)} className="mt-8 flex items-center gap-3">
            <div className="flex -space-x-3">
              <Image
                src={ceo.photo}
                alt={ceo.name}
                width={36}
                height={36}
                className="h-9 w-9 rounded-full object-cover ring-2 ring-brand-navy"
              />
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-[11px] font-semibold text-white ring-2 ring-brand-navy">
                +11
              </div>
            </div>
            <p className="text-sm text-white/60">
              Meet the <Link href="/about-us" className="font-semibold text-brand-gold hover:underline">team</Link> behind 250+ happy customers
            </p>
          </motion.div>
        </div>

        <div className="relative">
          <motion.div
            initial={{ opacity: 0, y: reduceMotion ? 0 : 24, scale: reduceMotion ? 1 : 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="glass shimmer-border rounded-3xl p-7 sm:p-8"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-heading/60">
              At a glance
            </p>
            <dl className="mt-5 grid grid-cols-2 gap-x-6 gap-y-6">
              {stats.slice(0, 2).map((stat) => (
                <div key={stat.label}>
                  <dt className="text-sm text-heading/60">{stat.label}</dt>
                  <dd className="mt-1 text-2xl font-semibold tracking-tight text-heading">
                    {stat.value}+
                  </dd>
                </div>
              ))}
            </dl>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: reduceMotion ? 0 : 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.55, ease: [0.22, 1, 0.36, 1] }}
            className={`glass glass-dark shimmer-border absolute -bottom-8 -left-6 hidden max-w-[15rem] rounded-2xl p-4 sm:block ${reduceMotion ? "" : "float-y"}`}
          >
            <div className="flex items-center gap-1 text-brand-gold">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} size={12} fill="currentColor" strokeWidth={0} />
              ))}
            </div>
            <p className="mt-2 text-xs leading-relaxed text-white/80">
              &ldquo;{featuredQuote.quote.slice(0, 78)}…&rdquo;
            </p>
            <p className="mt-2 text-[11px] font-semibold text-white/50">
              — {featuredQuote.name}, {featuredQuote.role}
            </p>
          </motion.div>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.9 }}
        className="relative hidden justify-center pb-8 sm:flex"
      >
        <a href="#stats" aria-label="Scroll to statistics" className={`text-white/50 hover:text-brand-gold ${reduceMotion ? "" : "float-y"}`}>
          <ChevronDown size={22} />
        </a>
      </motion.div>
    </section>
  );
}
