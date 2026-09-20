"use client";

import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

/**
 * The site's one loading visual — navy blurred backdrop, floating logo,
 * animated gold progress bar. Used for full-page route transitions
 * (RouteTransitionOverlay) and for auth actions (AuthLoadingOverlay) so
 * "loading" always looks the same everywhere on the site.
 */
export default function LogoLoadingOverlay({ visible }: { visible: boolean }) {
  const reduceMotion = useReducedMotion();

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="fixed inset-0 z-[200] flex items-center justify-center bg-brand-navy/60 backdrop-blur-2xl"
          role="status"
          aria-live="polite"
        >
          <div className="glow-field opacity-60" />
          <motion.div
            initial={{ scale: reduceMotion ? 1 : 0.9, opacity: 0, y: reduceMotion ? 0 : 8 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: reduceMotion ? 1 : 0.95, opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="relative flex flex-col items-center gap-5"
          >
            <Image
              src="/brand/logo-transparent.png"
              alt="Meteorite Real Estate"
              width={297}
              height={54}
              className={`h-auto w-44 object-contain sm:w-52 ${reduceMotion ? "" : "float-y"}`}
              priority
            />
            <div className="h-px w-32 overflow-hidden rounded-full bg-white/10">
              <div className="h-full w-1/3 rounded-full bg-brand-gold loading-bar" />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
