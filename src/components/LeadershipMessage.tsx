"use client";

import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useSpring, useTransform, type MotionValue } from "framer-motion";

/** One word of the message: it brightens as the reader's scroll reaches it. */
function Word({ children, progress, from, to, still }: { children: string; progress: MotionValue<number>; from: number; to: number; still: boolean }) {
  const opacity = useTransform(progress, [from, to], [0.4, 1]);
  return (
    <motion.span style={still ? undefined : { opacity }} className="mr-[0.26em] inline-block">
      {children}
    </motion.span>
  );
}

/**
 * The CEO's message, at the foot of the Leadership section: no card, no colour —
 * just a centred line of large type that is "read" by the scroll (each word
 * brightens in turn), then the rest of the note and the signature. Reduced-motion
 * visitors get the text at full brightness.
 */
export default function LeadershipMessage({ paragraphs, signerTitle, company }: { paragraphs: string[]; signerTitle: string; company: string }) {
  const reduce = useReducedMotion() ?? false;
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.92", "start 0.3"] });
  const progress = useSpring(scrollYProgress, { stiffness: 90, damping: 24, mass: 0.5 });
  const [lead, ...rest] = paragraphs;
  if (!lead) return null;
  const words = lead.split(/\s+/);

  return (
    <div ref={ref} className="mx-auto mt-14 max-w-3xl text-center">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-ink">A message from our CEO</p>
      <p className="mt-5 text-2xl font-semibold leading-snug tracking-tight text-heading sm:text-[1.75rem]">
        {words.map((w, i) => (
          <Word key={i} progress={progress} from={(i / words.length) * 0.85} to={(i / words.length) * 0.85 + 0.15} still={reduce}>
            {w}
          </Word>
        ))}
      </p>
      {rest.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: reduce ? 0 : 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto mt-5 max-w-xl space-y-2 text-[15px] leading-relaxed text-brand-ink/70"
        >
          {rest.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </motion.div>
      )}
      {(signerTitle || company) && (
        <p className="mt-6 text-sm text-brand-ink/66">
          {signerTitle && <span className="font-semibold text-heading">{signerTitle}</span>}
          {signerTitle && company && <span aria-hidden="true"> · </span>}
          {company}
        </p>
      )}
    </div>
  );
}
