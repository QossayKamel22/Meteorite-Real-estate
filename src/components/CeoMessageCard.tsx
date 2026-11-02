"use client";

import { useRef } from "react";
import { motion, useInView, useMotionTemplate, useMotionValue, useReducedMotion, useScroll, useSpring, useTransform, type MotionValue, type Variants } from "framer-motion";
import { BadgeCheck, GraduationCap, Handshake, Quote, ShieldCheck } from "lucide-react";

const EASE = [0.22, 1, 0.36, 1] as const;

const PILLARS = [
  { icon: ShieldCheck, label: "Trusted" },
  { icon: GraduationCap, label: "Educated" },
  { icon: Handshake, label: "Honest" },
  { icon: BadgeCheck, label: "Experienced" },
];

/** One word of the lead paragraph: it lights up as the reader's scroll reaches it. */
function Word({ children, progress, from, to, still }: { children: string; progress: MotionValue<number>; from: number; to: number; still: boolean }) {
  const opacity = useTransform(progress, [from, to], [0.22, 1]);
  return (
    <motion.span style={still ? undefined : { opacity }} className="mr-[0.28em] inline-block">
      {children}
    </motion.span>
  );
}

/**
 * The CEO message as a compact card with two pieces of motion: the lead sentence
 * is read by the scroll (each word lights up in turn as the card crosses the
 * screen), and a soft gold spotlight follows the pointer across the glass. The
 * rest of the message sits in two short columns, with the four pillars and the
 * signature on one line underneath. Reduced-motion visitors get a plain fade.
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
  const reduce = useReducedMotion() ?? false;
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.2 });

  // Scroll progress of the card through the viewport, smoothed; words light up over the middle of it.
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.9", "start 0.35"] });
  const progress = useSpring(scrollYProgress, { stiffness: 90, damping: 24, mass: 0.5 });

  const mx = useMotionValue(50);
  const my = useMotionValue(0);
  const spotlight = useMotionTemplate`radial-gradient(420px circle at ${mx}% ${my}%, rgba(245,165,36,0.16), transparent 60%)`;

  const card: Variants = {
    hidden: reduce ? { opacity: 0 } : { opacity: 0, y: 32 },
    show: { opacity: 1, y: 0, transition: { duration: reduce ? 0.3 : 0.8, ease: EASE, staggerChildren: reduce ? 0 : 0.09, delayChildren: 0.15 } },
  };
  const rise: Variants = {
    hidden: reduce ? { opacity: 0 } : { opacity: 0, y: 16 },
    show: { opacity: 1, y: 0, transition: { duration: reduce ? 0.2 : 0.7, ease: EASE } },
  };
  const draw: Variants = {
    hidden: reduce ? { opacity: 0 } : { scaleX: 0 },
    show: { opacity: 1, scaleX: 1, transition: { duration: 0.9, ease: EASE } },
  };

  const [lead, ...rest] = paragraphs;
  const leadWords = lead ? lead.split(/\s+/) : [];

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={inView ? "show" : "hidden"}
      variants={card}
      onPointerMove={(e) => {
        if (reduce) return;
        const r = e.currentTarget.getBoundingClientRect();
        mx.set(((e.clientX - r.left) / r.width) * 100);
        my.set(((e.clientY - r.top) / r.height) * 100);
      }}
      className="glass-podcast relative overflow-hidden rounded-[1.75rem] p-6 sm:p-9"
    >
      <motion.span aria-hidden="true" style={reduce ? undefined : { backgroundImage: spotlight }} className="pointer-events-none absolute inset-0" />
      <span aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-px overflow-hidden">
        <span className="edge-sweep block h-px w-1/3 bg-gradient-to-r from-transparent via-brand-podcast-accent-soft to-transparent" />
      </span>
      <Quote aria-hidden="true" className="float-y pointer-events-none absolute -right-3 -top-3 h-28 w-28 rotate-180 text-brand-podcast-accent opacity-[0.08]" strokeWidth={1.25} />

      <motion.div variants={rise} className="relative flex items-center gap-3">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-podcast-accent/15 text-brand-podcast-accent ring-1 ring-brand-podcast-accent/30">
          <Quote size={17} strokeWidth={1.75} />
        </span>
        <span className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-podcast-accent sm:text-sm">A message from our CEO</span>
        <motion.span variants={draw} style={{ transformOrigin: "left" }} className="hidden h-px flex-1 bg-gradient-to-r from-brand-podcast-accent/50 to-transparent sm:block" />
      </motion.div>

      {lead && (
        <p className="relative mt-5 text-lg font-medium leading-relaxed text-white sm:text-xl">
          {leadWords.map((w, i) => (
            <Word key={i} progress={progress} from={(i / leadWords.length) * 0.85} to={(i / leadWords.length) * 0.85 + 0.15} still={reduce}>
              {w}
            </Word>
          ))}
        </p>
      )}

      {rest.length > 0 && (
        <motion.div variants={rise} className="relative mt-4 space-y-3 text-sm leading-relaxed text-white/70 md:columns-2 md:gap-8 md:space-y-0 [&>p]:break-inside-avoid md:[&>p+p]:mt-3">
          {rest.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </motion.div>
      )}

      <motion.div variants={rise} className="relative mt-6 flex flex-col gap-4 border-t border-white/10 pt-5 sm:flex-row sm:items-center sm:justify-between">
        {(signerTitle || company) && (
          <div className="flex items-center gap-3">
            <span className="h-9 w-1 rounded-full bg-gradient-to-b from-brand-podcast-accent-soft to-brand-podcast-accent" />
            <div>
              {signerTitle && <p className="text-sm font-semibold text-white">{signerTitle}</p>}
              {company && <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-brand-podcast-accent">{company}</p>}
            </div>
          </div>
        )}
        <ul className="flex flex-wrap gap-2">
          {PILLARS.map(({ icon: Icon, label }) => (
            <li
              key={label}
              className="flex items-center gap-1.5 rounded-full bg-brand-podcast-accent/10 px-3 py-1 text-xs font-medium text-brand-podcast-accent-soft ring-1 ring-brand-podcast-accent/25 transition-transform duration-300 hover:-translate-y-0.5"
            >
              <Icon size={12} strokeWidth={1.75} />
              {label}
            </li>
          ))}
        </ul>
      </motion.div>
    </motion.div>
  );
}
