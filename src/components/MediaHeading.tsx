"use client";

import { useRef } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import MaskWords from "@/components/MaskWords";

const EASE = [0.22, 1, 0.36, 1] as const;

/** A section heading for the Media page: the gold rule draws, the title rises word by word, the note fades in. */
export default function MediaHeading({ kicker, title, note, as = "h2" }: { kicker: string; title: string; note?: string; as?: "h2" | "h3" }) {
  const reduce = useReducedMotion() ?? false;
  const ref = useRef<HTMLDivElement>(null);
  const show = useInView(ref, { once: true, amount: 0.6 });
  return (
    <div ref={ref}>
      <div className="flex items-center gap-2.5">
        <motion.span initial={{ scaleX: 0 }} animate={show ? { scaleX: 1 } : undefined} transition={{ duration: 0.8, ease: EASE }} style={{ transformOrigin: "left" }} className="h-px w-8 bg-brand-gold" />
        <span className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-gold">{kicker}</span>
      </div>
      <MaskWords as={as} text={title} show={show} delay={0.1} className="mt-3 text-3xl font-semibold tracking-tight text-heading sm:text-4xl" />
      {note && (
        <motion.p initial={{ opacity: 0, y: reduce ? 0 : 14 }} animate={show ? { opacity: 1, y: 0 } : undefined} transition={{ duration: 0.9, delay: 0.5, ease: EASE }} className="mt-3 max-w-xl text-[15px] leading-relaxed text-brand-ink/60">
          {note}
        </motion.p>
      )}
    </div>
  );
}
