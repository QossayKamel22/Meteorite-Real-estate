"use client";

import { motion, useReducedMotion } from "framer-motion";

/** Every admin page eases in (a template remounts on each navigation, a layout does not). */
export default function AdminTemplate({ children }: { children: React.ReactNode }) {
  const reduce = useReducedMotion();
  return (
    <motion.div initial={{ opacity: 0, y: reduce ? 0 : 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}>
      {children}
    </motion.div>
  );
}
