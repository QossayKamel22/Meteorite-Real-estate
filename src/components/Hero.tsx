"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "framer-motion";
import { ChevronDown, ShieldCheck, Star } from "lucide-react";
import { stats, ceo, testimonials } from "@/lib/content";
import Particles from "@/components/Particles";

const QUOTE_INTERVAL_MS = 4500;

export default function Hero() {
  const reduceMotion = useReducedMotion();
  const [quoteIndex, setQuoteIndex] = useState(0);

  useEffect(() => {
    if (reduceMotion) return;
    const timer = window.setInterval(
      () => setQuoteIndex((i) => (i + 1) % testimonials.length),
      QUOTE_INTERVAL_MS
    );
    return () => window.clearInterval(timer);
  }, [reduceMotion]);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [6, -6]), {
    stiffness: 150,
    damping: 18,
  });
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-6, 6]), {
    stiffness: 150,
    damping: 18,
  });

  function handlePointerMove(e: React.MouseEvent<HTMLDivElement>) {
    if (reduceMotion) return;
    const rect = e.currentTarget.getBoundingClientRect();
    mouseX.set((e.clientX - rect.left) / rect.width - 0.5);
    mouseY.set((e.clientY - rect.top) / rect.height - 0.5);
  }

  function handlePointerLeave() {
    mouseX.set(0);
    mouseY.set(0);
  }

  const rise = (delay: number) => ({
    initial: { opacity: 0, y: reduceMotion ? 0 : 18 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] as const },
  });
  const quote = testimonials[quoteIndex];

  return (
    <section className="relative overflow-hidden bg-brand-navy cine-bars">
      <div className="absolute inset-0 overflow-hidden">
        <Image
          src="/brand/hero-dubai-skyline.jpg"
          alt="Dubai skyline at dusk"
          fill
          priority
          className={`object-cover opacity-45 ${reduceMotion ? "" : "ken-burns"}`}
          sizes="100vw"
        />
        {!reduceMotion && <div className="light-sweep" />}
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-brand-navy via-brand-navy/75 to-brand-navy/40" />
      <div className="glow-field opacity-70" />
      <div className="grain-overlay" />
      <Particles />

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.5 }}
        className="absolute right-4 top-20 z-10 hidden items-center gap-2 sm:right-6 sm:top-24 sm:flex lg:right-8"
      >
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-gold opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-brand-gold" />
        </span>
        <span className="text-[11px] font-semibold uppercase tracking-[0.15em] text-white/60">
          Live in Dubai
        </span>
      </motion.div>

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
                className="h-9 w-9 rounded-full object-cover ring-2 ring-brand-navy transition-transform duration-300 hover:scale-110"
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

        <div
          className="relative [perspective:1000px]"
          onMouseMove={handlePointerMove}
          onMouseLeave={handlePointerLeave}
        >
          <motion.div
            initial={{ opacity: 0, y: reduceMotion ? 0 : 24, scale: reduceMotion ? 1 : 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
            style={reduceMotion ? undefined : { rotateX, rotateY, transformStyle: "preserve-3d" }}
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
            className={`glass glass-dark shimmer-border absolute -bottom-8 -left-6 hidden w-[16rem] rounded-2xl p-4 sm:block ${reduceMotion ? "" : "float-y"}`}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={quote.name}
                initial={{ opacity: 0, x: reduceMotion ? 0 : 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: reduceMotion ? 0 : -10 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              >
                <div className="flex items-center gap-1 text-brand-gold">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} size={12} fill="currentColor" strokeWidth={0} />
                  ))}
                </div>
                <p className="mt-2 min-h-[2.5rem] text-xs leading-relaxed text-white/80">
                  &ldquo;{quote.quote.slice(0, 78)}
                  {quote.quote.length > 78 ? "…" : ""}&rdquo;
                </p>
                <p className="mt-2 text-[11px] font-semibold text-white/50">
                  — {quote.name}, {quote.role}
                </p>
              </motion.div>
            </AnimatePresence>

            <div className="mt-3 flex items-center gap-1.5">
              {testimonials.map((t, i) => (
                <button
                  key={t.name}
                  type="button"
                  aria-label={`Show feedback from ${t.name}`}
                  onClick={() => setQuoteIndex(i)}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    i === quoteIndex ? "w-5 bg-brand-gold" : "w-1.5 bg-white/25"
                  }`}
                />
              ))}
            </div>
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
