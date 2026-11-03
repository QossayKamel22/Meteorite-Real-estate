"use client";

import { motion, useReducedMotion } from "framer-motion";

const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * A heading whose words rise one after another out of an invisible mask. Set `show` from
 * the parent's own in-view check so the whole block can start together.
 */
export default function MaskWords({
  text,
  show,
  delay = 0,
  className,
  as: Tag = "h2",
}: {
  text: string;
  show: boolean;
  delay?: number;
  className?: string;
  as?: "h1" | "h2" | "h3" | "p";
}) {
  const reduce = useReducedMotion();
  const MotionTag = motion[Tag];
  return (
    <MotionTag className={className} aria-label={text}>
      {text.split(" ").map((w, i) => (
        <span key={i} aria-hidden="true" className="inline-block overflow-hidden pb-[0.12em] align-bottom">
          <motion.span
            className="inline-block"
            initial={{ y: reduce ? 0 : "115%", opacity: reduce ? 0 : 1 }}
            animate={show ? { y: "0%", opacity: 1 } : undefined}
            transition={{ duration: reduce ? 0.2 : 0.95, delay: delay + i * 0.07, ease: EASE }}
          >
            {w}
            {i < text.split(" ").length - 1 ? " " : ""}
          </motion.span>
        </span>
      ))}
    </MotionTag>
  );
}
