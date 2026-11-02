"use client";

import Image from "next/image";
import { useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Expand } from "lucide-react";
import PosterViewer from "@/components/PosterViewer";
import { isServedImage } from "@/lib/image-url";
import type { Poster } from "@/lib/poster-series-shared";

const noSubscribe = () => () => {};

/**
 * The poster series as a small fanned deck: the cards overlap at rest and spread out when you
 * hover or focus them, so the whole series takes the space of one poster. Tap a card to open
 * the viewer, where you can page through and download.
 */
export default function DubaiSeries({ posters }: { posters: Poster[] }) {
  const reduce = useReducedMotion();
  const [spread, setSpread] = useState(false);
  const [open, setOpen] = useState<number | null>(null);
  const isClient = useSyncExternalStore(noSubscribe, () => true, () => false);
  if (posters.length === 0) return null;
  const mid = (posters.length - 1) / 2;
  const gap = spread ? 74 : 38;

  return (
    <>
      <div
        className="relative mx-auto h-[19rem] w-full max-w-xl sm:h-[21rem]"
        onMouseEnter={() => setSpread(true)}
        onMouseLeave={() => setSpread(false)}
        onFocusCapture={() => setSpread(true)}
        onBlurCapture={() => setSpread(false)}
      >
        <div aria-hidden="true" className="absolute inset-x-8 bottom-0 h-16 rounded-full bg-brand-gold/15 blur-3xl" />
        {posters.map((p, i) => {
          const d = i - mid;
          return (
            <motion.button
              key={p.src}
              type="button"
              onClick={() => setOpen(i)}
              aria-label={`Open poster ${i + 1} of ${posters.length}: ${p.alt}`}
              initial={{ opacity: 0, y: reduce ? 0 : 40, x: 0, rotate: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true, amount: 0.3 }}
              animate={{ x: d * gap, y: Math.abs(d) * (spread ? 4 : 8), rotate: reduce ? 0 : d * (spread ? 3 : 5) }}
              whileHover={reduce ? undefined : { y: -16, scale: 1.05, rotate: 0, zIndex: 40 }}
              transition={{ type: "spring", stiffness: 190, damping: 22, delay: spread ? 0 : 0 }}
              style={{ zIndex: 10 - Math.round(Math.abs(d) * 2) }}
              className="group absolute left-1/2 top-2 -ml-[5.1rem] aspect-[9/16] w-[10.2rem] overflow-hidden rounded-2xl shadow-[0_26px_50px_-24px_rgba(0,0,0,0.75)] ring-1 ring-white/15 hover:ring-brand-gold/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold sm:w-[11.2rem] sm:-ml-[5.6rem]"
            >
              <Image src={p.src} alt="" fill sizes="180px" unoptimized={isServedImage(p.src)} className="object-cover" />
              <span className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition-all duration-300 group-hover:bg-black/25 group-hover:opacity-100">
                <Expand size={22} className="text-white drop-shadow" />
              </span>
            </motion.button>
          );
        })}
      </div>

      {isClient &&
        createPortal(
          <AnimatePresence>{open !== null && <PosterViewer posters={posters} index={open} setIndex={setOpen} onClose={() => setOpen(null)} />}</AnimatePresence>,
          document.body
        )}
    </>
  );
}
