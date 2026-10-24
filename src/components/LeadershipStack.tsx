"use client";

import { useRef } from "react";
import Image from "next/image";
import { motion, useInView, useReducedMotion, useScroll, useSpring, useTransform, type Variants } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import type { Agent } from "@/lib/agents-data";
import { isServedImage } from "@/lib/image-url";

/** A long, soft ease-out (no overshoot) so motion settles gently. */
const SMOOTH = [0.25, 0.1, 0.25, 1] as const;

const paragraphs = (text: string | undefined) =>
  (text ?? "")
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);

/** One leader as a full-width editorial row. Rows alternate sides; the photo drifts slightly against the scroll. */
function Row({ leader, index }: { leader: Agent; index: number }) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLElement>(null);
  const shown = useInView(ref, { once: true, amount: 0.2 });
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  // Spring-smoothed so the portrait glides instead of tracking every wheel tick.
  const smooth = useSpring(scrollYProgress, { stiffness: 70, damping: 22, mass: 0.6 });
  const drift = useTransform(smooth, [0, 1], reduce ? ["0%", "0%"] : ["4%", "-4%"]);
  const flip = index % 2 === 1;
  const side = flip ? 1 : -1;
  const bio = paragraphs(leader.bio);
  const background = paragraphs(leader.background);

  const group: Variants = { hidden: {}, show: { transition: { staggerChildren: reduce ? 0 : 0.08, delayChildren: 0.05 } } };
  const rise: Variants = {
    hidden: reduce ? { opacity: 0 } : { opacity: 0, y: 16 },
    show: { opacity: 1, y: 0, transition: { duration: reduce ? 0.2 : 0.9, ease: SMOOTH } },
  };
  const photo: Variants = {
    hidden: reduce ? { opacity: 0 } : { opacity: 0, x: side * -36 },
    show: { opacity: 1, x: 0, transition: { duration: reduce ? 0.2 : 1.1, ease: SMOOTH } },
  };

  return (
    <motion.article
      ref={ref}
      aria-label={leader.name}
      initial="hidden"
      animate={shown ? "show" : "hidden"}
      variants={group}
      className={`relative grid items-center gap-8 lg:gap-14 ${flip ? "lg:grid-cols-[1fr_minmax(0,330px)]" : "lg:grid-cols-[minmax(0,330px)_1fr]"}`}
    >
      <motion.div variants={photo} className={`relative mx-auto w-full max-w-[17rem] sm:max-w-xs lg:max-w-none ${flip ? "lg:order-2" : ""}`}>
        {/* offset gold frame behind the portrait */}
        <div aria-hidden="true" className={`absolute inset-0 rounded-[2rem] border border-brand-gold/50 ${flip ? "-translate-x-4 translate-y-4" : "translate-x-4 translate-y-4"}`} />
        <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem] bg-brand-navy shadow-[0_30px_70px_-30px_rgba(13,16,49,0.6)] ring-1 ring-brand-gold/20">
          <motion.div style={{ y: drift }} className="absolute -inset-[8%]">
            <Image
              src={leader.photo}
              alt={`Portrait of ${leader.name}`}
              fill
              sizes="(min-width: 1024px) 420px, 90vw"
              unoptimized={isServedImage(leader.photo)}
              className="object-cover object-top"
            />
          </motion.div>
          <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-brand-navy/70 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6">
            <p className="text-base font-semibold tracking-tight text-white">{leader.name.split(" ").slice(0, 2).join(" ")}</p>
            <p className="mt-0.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-brand-gold-soft">{leader.title}</p>
          </div>
        </div>
      </motion.div>

      <div className="relative">
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -top-6 left-0 select-none text-[4.5rem] font-semibold leading-none tracking-tighter text-transparent [-webkit-text-stroke:1px_rgba(219,204,59,0.3)] sm:text-[6rem]"
        >
          {String(index + 1).padStart(2, "0")}
        </span>
        <div className="relative pt-16 sm:pt-20">
          <motion.div variants={rise} className="flex items-center gap-2.5">
            <span className="h-px w-8 bg-brand-gold" />
            <span className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-gold">{leader.title}</span>
          </motion.div>
          <motion.h3 variants={rise} className="mt-3 text-2xl font-semibold tracking-tight text-heading sm:text-3xl">{leader.name}</motion.h3>

          {bio.map((p, i) => (
            <motion.p key={`b${i}`} variants={rise} className={`max-w-2xl leading-relaxed ${i === 0 ? "mt-5 text-base text-brand-ink/75 sm:text-[17px]" : "mt-3 text-[15px] text-brand-ink/65"}`}>
              {p}
            </motion.p>
          ))}
          {background.map((p, i) => (
            <motion.p key={`g${i}`} variants={rise} className="mt-3 max-w-2xl text-[15px] leading-relaxed text-brand-ink/60">{p}</motion.p>
          ))}

          {leader.credentials && leader.credentials.length > 0 && (
            <ul className="mt-5 flex flex-wrap gap-2.5">
              {leader.credentials.map((c) => (
                <motion.li key={c} variants={rise} className="glass rounded-full px-3.5 py-1 text-[13px] font-medium text-brand-ink/70">{c}</motion.li>
              ))}
            </ul>
          )}
          {leader.profileUrl && (
            <motion.div variants={rise}>
              <a href={leader.profileUrl} target="_blank" rel="noopener noreferrer" className="mt-8 inline-flex items-center gap-1.5 text-sm font-semibold text-heading hover:text-brand-gold">
                View full leadership profile <ArrowUpRight size={15} />
              </a>
            </motion.div>
          )}
        </div>
      </div>
    </motion.article>
  );
}

/**
 * Leadership as it appears on About Us: not a carousel but a long-form spread —
 * every leader gets a full editorial row (portrait on alternating sides, big
 * numeral, the whole story), so the page reads top to bottom like a profile
 * feature. The homepage shows the same people as a swipeable carousel.
 */
export default function LeadershipStack({ leaders }: { leaders: Agent[] }) {
  if (leaders.length === 0) return null;
  return (
    <section aria-label="Leadership" className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto mb-12 max-w-2xl text-center sm:mb-16">
        <div className="flex items-center justify-center gap-2.5">
          <span className="h-px w-8 bg-brand-gold" />
          <span className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-gold">Leadership</span>
          <span className="h-px w-8 bg-brand-gold" />
        </div>
        <h2 className="mt-3 text-2xl font-semibold tracking-tight text-heading sm:text-3xl">The people leading Meteorite</h2>
      </div>
      <div className="space-y-16 sm:space-y-24">
        {leaders.map((l, i) => (
          <Row key={l.id} leader={l} index={i} />
        ))}
      </div>
    </section>
  );
}
