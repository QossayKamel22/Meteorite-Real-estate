"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Lock } from "lucide-react";

/** A small animated "secure payment" badge — pulsing rings behind a lock icon. */
export default function AnimatedSecureLock() {
  const reduceMotion = useReducedMotion();

  return (
    <div className="relative mx-auto flex h-20 w-20 items-center justify-center">
      {!reduceMotion &&
        [0, 1].map((ring) => (
          <motion.span
            key={ring}
            className="absolute inset-0 rounded-full border border-brand-gold/40"
            initial={{ scale: 0.6, opacity: 0.6 }}
            animate={{ scale: [0.6, 1.6], opacity: [0.6, 0] }}
            transition={{
              duration: 2.4,
              repeat: Infinity,
              ease: "easeOut",
              delay: ring * 1.2,
            }}
          />
        ))}
      <motion.div
        className="relative flex h-14 w-14 items-center justify-center rounded-full bg-brand-gold/15 text-brand-gold ring-1 ring-brand-gold/30"
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        whileHover={reduceMotion ? undefined : { scale: 1.08, rotate: [0, -6, 6, 0] }}
      >
        <Lock size={24} strokeWidth={1.75} />
      </motion.div>
    </div>
  );
}
