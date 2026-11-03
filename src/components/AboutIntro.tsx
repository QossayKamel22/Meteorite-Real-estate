"use client";

import { useRef } from "react";
import Link from "next/link";
import { motion, useInView, useReducedMotion, useScroll, useSpring, useTransform, type MotionValue } from "framer-motion";
import { ShieldCheck, Award, BadgeCheck } from "lucide-react";
import { company, credentials } from "@/lib/content";
import MaskWords from "@/components/MaskWords";

const EASE = [0.22, 1, 0.36, 1] as const;
const credentialIcons = [ShieldCheck, Award, BadgeCheck];

/** One credential on the timeline: its node lights up when the gold thread reaches it. */
function Credential({ text, index, total, progress, shown, still }: { text: string; index: number; total: number; progress: MotionValue<number>; shown: boolean; still: boolean }) {
  const Icon = credentialIcons[index % credentialIcons.length];
  const at = (index + 0.5) / total;
  const lit = useTransform(progress, [at - 0.12, at], [0, 1]);
  const iconColor = useTransform(lit, [0, 1], ["#dbcc3b", "#0d1031"]);
  return (
    <motion.li
      initial={{ opacity: 0, x: still ? 0 : 40 }}
      animate={shown ? { opacity: 1, x: 0 } : undefined}
      transition={{ duration: 0.9, delay: 0.2 + index * 0.12, ease: EASE }}
      className="relative pl-14"
    >
      <span className="absolute left-0 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-brand-gold/40 bg-brand-paper text-brand-gold">
        <motion.span aria-hidden="true" style={still ? { opacity: 1 } : { opacity: lit }} className="absolute inset-0 rounded-full bg-brand-gold shadow-[0_0_24px_2px_rgba(219,204,59,0.55)]" />
        <motion.span style={still ? undefined : { color: iconColor }} className="relative">
          <Icon size={18} strokeWidth={1.9} />
        </motion.span>
      </span>
      <div className="glass shimmer-border group rounded-2xl px-5 py-4 transition-transform duration-300 hover:-translate-y-0.5 hover:translate-x-1">
        <span className="text-[15px] leading-relaxed text-brand-ink/80">{text}</span>
      </div>
    </motion.li>
  );
}

/**
 * About the company on the homepage: a giant "2005" drifts behind the headline as you
 * scroll, the headline rises word by word, and the credentials hang on a gold thread
 * that draws itself down the page, lighting each node as it reaches it.
 */
export default function AboutIntro() {
  const reduce = useReducedMotion() ?? false;
  const ref = useRef<HTMLElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const shown = useInView(ref, { once: true, amount: 0.25 });
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const drift = useTransform(scrollYProgress, [0, 1], reduce ? ["0%", "0%"] : ["12%", "-18%"]);
  const { scrollYProgress: listProgress } = useScroll({ target: listRef, offset: ["start 0.75", "end 0.55"] });
  const thread = useSpring(listProgress, { stiffness: 80, damping: 22, mass: 0.5 });

  return (
    <section ref={ref} className="relative overflow-hidden bg-brand-paper">
      <motion.span
        aria-hidden="true"
        style={{ y: drift }}
        className="pointer-events-none absolute -left-4 top-1/2 -translate-y-1/2 select-none text-[16rem] font-semibold leading-none tracking-tighter text-transparent [-webkit-text-stroke:1px_rgba(219,204,59,0.28)] sm:text-[24rem]"
      >
        2005
      </motion.span>

      <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div>
            <div className="flex items-center gap-2.5">
              <motion.span initial={{ scaleX: 0 }} animate={shown ? { scaleX: 1 } : undefined} transition={{ duration: 0.8, ease: EASE }} style={{ transformOrigin: "left" }} className="h-px w-8 bg-brand-gold" />
              <span className="text-sm font-semibold uppercase tracking-[0.2em] text-gold-ink">{`About ${company.name}`}</span>
            </div>
            <MaskWords text="A RERA-certified brokerage, trusted since 2005" show={shown} delay={0.1} className="mt-3 max-w-xl text-3xl font-semibold tracking-tight text-heading sm:text-4xl" />
            <motion.p
              initial={{ opacity: 0, y: reduce ? 0 : 20 }}
              animate={shown ? { opacity: 1, y: 0 } : undefined}
              transition={{ duration: 0.9, delay: 0.6, ease: EASE }}
              className="mt-5 max-w-2xl text-lg leading-relaxed text-brand-ink/70"
            >
              {company.legalTagline}
            </motion.p>
            <motion.div initial={{ opacity: 0 }} animate={shown ? { opacity: 1 } : undefined} transition={{ duration: 0.8, delay: 0.85 }}>
              <Link prefetch={false} href="/about-us" className="group mt-6 inline-flex items-center gap-2 text-sm font-semibold text-heading transition-colors hover:text-gold-ink">
                Read our full story
                <span aria-hidden="true" className="inline-block transition-transform duration-300 group-hover:translate-x-1.5">→</span>
              </Link>
            </motion.div>
          </div>

          <div className="relative">
            <span aria-hidden="true" className="absolute bottom-5 left-5 top-5 w-px bg-brand-gold/25" />
            <motion.span aria-hidden="true" style={reduce ? undefined : { scaleY: thread }} className="absolute bottom-5 left-5 top-5 w-px origin-top bg-gradient-to-b from-brand-gold-soft to-brand-gold shadow-[0_0_10px_1px_rgba(219,204,59,0.6)]" />
            <ul ref={listRef} role="list" className="relative space-y-4">
              {credentials.map((item, i) => (
                <Credential key={item} text={item} index={i} total={credentials.length} progress={thread} shown={shown} still={reduce} />
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
