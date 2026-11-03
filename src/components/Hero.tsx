"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { isServedImage } from "@/lib/image-url";
import Link from "next/link";
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "framer-motion";
import { ChevronDown, ShieldCheck } from "lucide-react";
import type { StatsList } from "@/lib/site-stats";
import type { Agent } from "@/lib/agents-data";
import type { Testimonial } from "@/lib/testimonials-data";
import type { HomepageContent } from "@/lib/homepage-content";
import Particles from "@/components/Particles";
import HeroReviews from "@/components/HeroReviews";
import type { HeroImage } from "@/lib/hero-images-shared";

const SLIDE_MS = 7000;

export default function Hero({
  stats,
  ceo,
  testimonials,
  content,
  images,
}: {
  stats: StatsList;
  ceo: Agent | undefined;
  testimonials: Testimonial[];
  content: HomepageContent;
  images: HeroImage[];
}) {
  const reduceMotion = useReducedMotion();
  const [slide, setSlide] = useState(0);
  const many = images.length > 1 && !reduceMotion;
  useEffect(() => {
    if (!many) return;
    const t = window.setInterval(() => setSlide((s) => (s + 1) % images.length), SLIDE_MS);
    return () => window.clearInterval(t);
  }, [many, images.length]);

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
    initial: { opacity: 1, y: reduceMotion ? 0 : 18 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] as const },
  });

  return (
    <section className="relative -mt-16 overflow-hidden bg-brand-navy cine-bars">
      <div className="absolute inset-0 overflow-hidden">
        {images.map((img, i) => (
          <Image
            key={img.src}
            src={img.src}
            unoptimized={img.src.startsWith("/api/img/")}
            alt={i === slide ? img.alt : ""}
            aria-hidden={i === slide ? undefined : true}
            fill
            priority={i === 0}
            loading={i === 0 ? "eager" : "lazy"}
            sizes="100vw"
            className={`object-cover transition-opacity duration-[1800ms] ease-in-out ${i === slide ? "opacity-90" : "opacity-0"} ${reduceMotion ? "" : "ken-burns"}`}
            style={reduceMotion ? undefined : { animationDelay: `${-(i * 9)}s` }}
          />
        ))}
        {!reduceMotion && <div className="light-sweep" />}
      </div>
      {/* grade: darker on the left where the headline sits, a vignette, and a long fade into the page below */}
      <div className="absolute inset-0 bg-[linear-gradient(100deg,rgba(8,10,34,0.8)_0%,rgba(8,10,34,0.38)_48%,rgba(8,10,34,0.08)_100%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_55%,rgba(4,5,20,0.5)_100%)]" />
      <div className="absolute inset-x-0 bottom-0 h-1/4 bg-gradient-to-t from-brand-navy to-transparent" />
      <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-[#060820]/80 to-transparent" />
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

      <div className="relative mx-auto grid max-w-7xl gap-14 px-4 pt-32 pb-24 sm:px-6 sm:pt-40 sm:pb-32 lg:grid-cols-[1.15fr_0.85fr] lg:items-center lg:px-8 lg:pb-40 lg:pt-48">
        <div>
          <motion.div {...rise(0)} className="glass glass-dark inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold text-white/85">
            <ShieldCheck size={14} className="text-brand-gold" />
            {content.heroBadge}
          </motion.div>
          <motion.h1
            {...rise(0.1)}
            className="mt-6 max-w-2xl text-4xl font-medium leading-[1.1] tracking-tight text-white sm:text-5xl lg:text-[3.6rem] [text-shadow:0_2px_30px_rgba(0,0,0,0.45)]"
          >
            {content.heroHeadline}
          </motion.h1>
          <motion.p
            {...rise(0.18)}
            className="mt-5 max-w-xl text-lg leading-relaxed text-white/75"
          >
            {content.heroSubheadline}
          </motion.p>

          <motion.div {...rise(0.26)} className="mt-10 flex flex-col gap-3 sm:flex-row">
            <Link prefetch={false}
              href="/for-sale"
              className="rounded-full bg-brand-gold px-7 py-3.5 text-center text-[15px] font-semibold text-brand-navy shadow-[0_8px_24px_-8px_rgba(219,204,59,0.6)] transition-transform duration-200 hover:scale-[1.03]"
            >
              Browse properties for sale
            </Link>
            <Link prefetch={false}
              href="/for-rent"
              className="glass rounded-full px-7 py-3.5 text-center text-[15px] font-semibold text-white transition-transform duration-200 hover:scale-[1.03]"
            >
              Browse properties for rent
            </Link>
          </motion.div>

          <motion.div {...rise(0.34)} className="mt-8 flex items-center gap-3">
            <div className="flex -space-x-3">
              {ceo && (
                <Image
                  src={ceo.photo}
                  unoptimized={isServedImage(ceo.photo)}
                  alt={ceo.name}
                  width={36}
                  height={36}
                  className="h-9 w-9 rounded-full object-cover ring-2 ring-brand-navy transition-transform duration-300 hover:scale-110"
                />
              )}
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-[11px] font-semibold text-white ring-2 ring-brand-navy">
                +11
              </div>
            </div>
            <p className="text-sm text-white/60">
              Meet the <Link prefetch={false} href="/about-us" className="font-semibold text-brand-gold hover:underline">team</Link> behind {stats.find((s) => s.key === "happyCustomers")?.value ?? 250}+ happy customers
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

          <HeroReviews testimonials={testimonials} />
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
