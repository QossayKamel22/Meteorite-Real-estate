"use client";

import { useRef } from "react";
import { motion, useInView, useReducedMotion, type Variants } from "framer-motion";
import { BadgeCheck, GraduationCap, Handshake, Quote, ShieldCheck } from "lucide-react";

const EASE = [0.22, 1, 0.36, 1] as const;

const PILLARS = [
  { icon: ShieldCheck, label: "Trusted" },
  { icon: GraduationCap, label: "Educated" },
  { icon: Handshake, label: "Honest" },
  { icon: BadgeCheck, label: "Experienced" },
];

/**
 * The CEO message card with a choreographed entrance once it scrolls into view:
 * the card lifts in, the quote chip pops, the lead paragraph resolves word by
 * word, the remaining copy and the four pillars follow in sequence, and the
 * signature's accent bar draws down. A gold highlight then travels slowly along
 * the card's top edge. Reduced-motion visitors get a plain fade.
 */
export default function CeoMessageCard({
  paragraphs,
  signerTitle,
  company,
}: {
  paragraphs: string[];
  signerTitle: string;
  company: string;
}) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.25 });

  const card: Variants = {
    hidden: reduce ? { opacity: 0 } : { opacity: 0, y: 48, scale: 0.97 },
    show: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { duration: reduce ? 0.3 : 0.9, ease: EASE, staggerChildren: reduce ? 0 : 0.1, delayChildren: 0.25 },
    },
  };
  const rise: Variants = {
    hidden: reduce ? { opacity: 0 } : { opacity: 0, y: 22, filter: "blur(6px)" },
    show: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: reduce ? 0.2 : 0.75, ease: EASE } },
  };
  const chip: Variants = {
    hidden: reduce ? { opacity: 0 } : { opacity: 0, scale: 0.4, rotate: -25 },
    show: { opacity: 1, scale: 1, rotate: 0, transition: { type: "spring", stiffness: 260, damping: 16 } },
  };
  const watermark: Variants = {
    hidden: reduce ? { opacity: 0 } : { opacity: 0, scale: 0.5, rotate: 160 },
    show: { opacity: 1, scale: 1, rotate: 180, transition: { duration: 1.4, ease: EASE } },
  };
  const words: Variants = {
    hidden: {},
    show: { transition: { staggerChildren: reduce ? 0 : 0.028, delayChildren: 0.05 } },
  };
  const word: Variants = {
    hidden: reduce ? { opacity: 0 } : { opacity: 0, y: 14, filter: "blur(5px)" },
    show: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: reduce ? 0.2 : 0.55, ease: EASE } },
  };
  const pillar: Variants = {
    hidden: reduce ? { opacity: 0 } : { opacity: 0, y: 14, scale: 0.85 },
    show: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 280, damping: 18 } },
  };
  const bar: Variants = {
    hidden: reduce ? { opacity: 0 } : { scaleY: 0 },
    show: { opacity: 1, scaleY: 1, transition: { duration: 0.7, ease: EASE } },
  };

  const [lead, ...rest] = paragraphs;

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={inView ? "show" : "hidden"}
      variants={card}
      className="glass-podcast relative overflow-hidden rounded-[2rem] p-8 sm:p-12"
    >
      {/* travelling highlight on the top edge */}
      <span aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-px overflow-hidden">
        <span className="edge-sweep block h-px w-1/3 bg-gradient-to-r from-transparent via-brand-podcast-accent-soft to-transparent" />
      </span>

      <motion.span variants={watermark} aria-hidden="true" className="pointer-events-none absolute -right-4 -top-4 block">
        <Quote className="float-y h-36 w-36 text-brand-podcast-accent opacity-[0.09]" strokeWidth={1.25} />
      </motion.span>

      <motion.div variants={rise} className="flex items-center gap-3">
        <motion.span
          variants={chip}
          className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-podcast-accent/15 text-brand-podcast-accent ring-1 ring-brand-podcast-accent/30"
        >
          <Quote size={20} strokeWidth={1.75} />
        </motion.span>
        <span className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-podcast-accent">
          A message from our CEO
        </span>
      </motion.div>

      <div className="mt-8 space-y-5">
        {lead && (
          <motion.p variants={words} className="text-xl font-medium leading-relaxed text-white sm:text-2xl">
            {lead.split(/\s+/).map((w, i) => (
              <motion.span key={i} variants={word} className="mr-[0.28em] inline-block">
                {w}
              </motion.span>
            ))}
          </motion.p>
        )}
        {rest.map((p, i) => (
          <motion.p key={i} variants={rise} className="text-base leading-relaxed text-white/70 sm:text-lg">
            {p}
          </motion.p>
        ))}
      </div>

      <ul className="mt-8 flex flex-wrap gap-2.5">
        {PILLARS.map(({ icon: Icon, label }) => (
          <motion.li
            key={label}
            variants={pillar}
            whileHover={reduce ? undefined : { y: -3, scale: 1.04 }}
            className="flex items-center gap-2 rounded-full bg-brand-podcast-accent/10 px-4 py-1.5 text-sm font-medium text-brand-podcast-accent-soft ring-1 ring-brand-podcast-accent/25"
          >
            <Icon size={14} strokeWidth={1.75} />
            {label}
          </motion.li>
        ))}
      </ul>

      {(signerTitle || company) && (
        <motion.div variants={rise} className="mt-10 flex items-center gap-4 border-t border-white/10 pt-6">
          <motion.span
            variants={bar}
            style={{ transformOrigin: "top" }}
            className="h-10 w-1 rounded-full bg-gradient-to-b from-brand-podcast-accent-soft to-brand-podcast-accent"
          />
          <div>
            {signerTitle && <p className="text-base font-semibold text-white">{signerTitle}</p>}
            {company && (
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-podcast-accent">{company}</p>
            )}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
