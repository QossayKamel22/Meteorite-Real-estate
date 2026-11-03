"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { ChevronDown } from "lucide-react";
import MaskWords from "@/components/MaskWords";

const EASE = [0.22, 1, 0.36, 1] as const;

export type HeroChip = { label: string; value?: number };

function Chip({ chip, index, still }: { chip: HeroChip; index: number; still: boolean }) {
  const [n, setN] = useState(still ? chip.value ?? 0 : 0);
  useEffect(() => {
    if (chip.value === undefined || still) return;
    let raf = 0;
    const t0 = performance.now() + 900 + index * 120;
    const tick = (now: number) => {
      const k = Math.max(0, Math.min(1, (now - t0) / 1300));
      setN(Math.round((chip.value ?? 0) * (1 - Math.pow(1 - k, 3))));
      if (k < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [chip.value, still, index]);
  return (
    <motion.li
      initial={{ opacity: 0, y: still ? 0 : 24, scale: still ? 1 : 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: "spring", stiffness: 140, damping: 16, delay: 0.85 + index * 0.1 }}
      className="flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.06] px-4 py-2 text-sm text-white/85 backdrop-blur-md"
    >
      {chip.value !== undefined && <span className="text-lg font-semibold tabular-nums text-brand-gold">{n}</span>}
      <span>{chip.label}</span>
    </motion.li>
  );
}

/**
 * The opening of a listings page: a night photograph that drifts with the scroll under a dark
 * grade, meteorites crossing the sky, a headline that rises word by word and a row of chips
 * (numbers count up). Shared by For Sale and For Rent, each with its own picture.
 */
export default function PageHero({ image, kicker, title, text, chips, children }: { image: string; kicker: string; title: string; text: string; chips: HeroChip[]; children?: React.ReactNode }) {
  const reduce = useReducedMotion() ?? false;
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], reduce ? ["0%", "0%"] : ["0%", "22%"]);
  const fade = useTransform(scrollYProgress, [0, 0.8], [1, reduce ? 1 : 0.2]);

  return (
    <section ref={ref} className="relative isolate -mt-16 overflow-hidden bg-brand-navy pb-20 pt-36 sm:pb-28 sm:pt-44">
      <motion.div aria-hidden="true" style={{ y }} className="absolute -inset-x-4 -top-8 bottom-0 -z-20">
        <Image src={image} alt="" fill priority sizes="100vw" className={`object-cover opacity-75 ${reduce ? "" : "ken-burns"}`} />
      </motion.div>
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-[linear-gradient(to_bottom,rgba(8,10,34,0.7),rgba(8,10,34,0.5)_45%,rgba(13,16,49,0.97))]" />
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_center,transparent_35%,rgba(4,5,20,0.65)_100%)]" />
      <div className="grain-overlay" />
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <span className="shooting-star left-[10%] top-[12%]" style={{ animationDelay: "1s" }} />
        <span className="shooting-star left-[44%] top-[5%]" style={{ animationDelay: "4.2s", animationDuration: "11s" }} />
        <span className="shooting-star left-[66%] top-[20%]" style={{ animationDelay: "7s", animationDuration: "10s" }} />
      </div>

      <motion.div style={{ opacity: fade }} className="relative mx-auto max-w-5xl px-4 text-center sm:px-6 lg:px-8">
        <div className="flex items-center justify-center gap-2.5">
          <motion.span initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 0.9, ease: EASE }} style={{ transformOrigin: "right" }} className="h-px w-10 bg-brand-gold" />
          <span className="text-sm font-semibold uppercase tracking-[0.28em] text-brand-gold">{kicker}</span>
          <motion.span initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 0.9, ease: EASE }} style={{ transformOrigin: "left" }} className="h-px w-10 bg-brand-gold" />
        </div>
        <MaskWords as="h1" text={title} show delay={0.15} className="mt-5 text-4xl font-semibold leading-[1.08] tracking-tight text-white [text-shadow:0_2px_30px_rgba(0,0,0,0.5)] sm:text-6xl" />
        <motion.p initial={{ opacity: 1, y: reduce ? 0 : 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, delay: 0.7, ease: EASE }} className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-white/70 sm:text-lg">
          {text}
        </motion.p>
        <ul className="mt-8 flex flex-wrap items-center justify-center gap-3">
          {chips.map((c, i) => (
            <Chip key={c.label} chip={c} index={i} still={reduce} />
          ))}
        </ul>
        {children}
        {!reduce && !children && (
          <motion.span aria-hidden="true" initial={{ opacity: 0 }} animate={{ opacity: 1, y: [0, 8, 0] }} transition={{ opacity: { delay: 1.6 }, y: { duration: 2, repeat: Infinity, ease: "easeInOut", delay: 1.6 } }} className="mt-10 inline-block text-white/45">
            <ChevronDown size={22} />
          </motion.span>
        )}
      </motion.div>
    </section>
  );
}
