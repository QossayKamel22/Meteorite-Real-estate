"use client";

import { motion, useReducedMotion } from "framer-motion";

type Props = {
  kicker?: string;
  title: React.ReactNode;
  as?: "h1" | "h2" | "h3";
  align?: "left" | "center";
  theme?: "dark" | "light";
  titleClassName?: string;
  className?: string;
};

const SIZE_BY_TAG: Record<NonNullable<Props["as"]>, string> = {
  h1: "text-4xl font-semibold tracking-tight sm:text-5xl",
  h2: "text-3xl font-semibold tracking-tight sm:text-4xl",
  h3: "text-lg font-semibold",
};

/**
 * Premium section-heading treatment: the gold kicker line draws in first,
 * then the title reveals upward from behind an overflow mask (a "curtain"
 * effect), distinct from the plainer fade used for surrounding body copy.
 */
export default function SectionHeading({
  kicker,
  title,
  as = "h2",
  align = "left",
  theme = "dark",
  titleClassName,
  className = "",
}: Props) {
  const reduceMotion = useReducedMotion();
  const alignClass = align === "center" ? "items-center text-center" : "items-start text-left";
  const titleColor = theme === "light" ? "text-white" : "text-heading";
  const MotionTag = as === "h1" ? motion.h1 : as === "h3" ? motion.h3 : motion.h2;

  return (
    <div className={`flex flex-col ${alignClass} ${className}`}>
      {kicker && (
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
          className="flex items-center gap-2.5"
        >
          <motion.span
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            style={{ transformOrigin: align === "center" ? "center" : "left" }}
            className="h-px w-8 bg-brand-gold"
          />
          <span className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-gold">
            {kicker}
          </span>
        </motion.div>
      )}
      <div className="overflow-hidden py-0.5">
        <MotionTag
          initial={{ y: reduceMotion ? 0 : "100%", opacity: 0 }}
          whileInView={{ y: "0%", opacity: 1 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: kicker ? 0.15 : 0 }}
          className={`${titleColor} ${titleClassName ?? SIZE_BY_TAG[as]} ${kicker ? "mt-3" : ""}`}
        >
          {title}
        </MotionTag>
      </div>
    </div>
  );
}
