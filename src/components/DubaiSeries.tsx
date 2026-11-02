"use client";

import Image from "next/image";
import { useEffect, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ChevronLeft, ChevronRight, Download, Expand, X } from "lucide-react";
import { isServedImage } from "@/lib/image-url";
import type { Poster } from "@/lib/poster-series-shared";

const EASE = [0.22, 1, 0.36, 1] as const;
const noSubscribe = () => () => {};

/** Full-screen viewer for the posters: arrows, keys, swipe-free and one tap to close. */
function Viewer({ posters, index, setIndex, onClose }: { posters: Poster[]; index: number; setIndex: (i: number) => void; onClose: () => void }) {
  const n = posters.length;
  const go = (d: number) => setIndex((index + d + n) % n);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") setIndex((index + 1) % n);
      if (e.key === "ArrowLeft") setIndex((index - 1 + n) % n);
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [index, n, onClose, setIndex]);
  const p = posters[index];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-[#05061a]/92 p-4 backdrop-blur-md"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={p.alt}
    >
      <div className="relative flex max-h-full items-center gap-3 sm:gap-6" onClick={(e) => e.stopPropagation()}>
        <button type="button" onClick={() => go(-1)} aria-label="Previous poster" className="hidden h-11 w-11 flex-none items-center justify-center rounded-full border border-white/20 text-white transition-colors hover:border-brand-gold hover:text-brand-gold sm:flex">
          <ChevronLeft size={20} />
        </button>
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={p.src}
            initial={{ opacity: 0, scale: 0.97, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.3, ease: EASE }}
            className="relative aspect-[9/16] h-[82vh] max-h-[860px] overflow-hidden rounded-2xl shadow-[0_40px_90px_-30px_rgba(0,0,0,0.9)] ring-1 ring-brand-gold/40"
          >
            <Image src={p.src} alt={p.alt} fill sizes="(min-width: 640px) 480px, 90vw" unoptimized={isServedImage(p.src)} className="object-cover" priority />
          </motion.div>
        </AnimatePresence>
        <button type="button" onClick={() => go(1)} aria-label="Next poster" className="hidden h-11 w-11 flex-none items-center justify-center rounded-full border border-white/20 text-white transition-colors hover:border-brand-gold hover:text-brand-gold sm:flex">
          <ChevronRight size={20} />
        </button>

        <div className="absolute -top-3 right-0 flex items-center gap-2 sm:-right-2">
          <a href={p.src} download={`meteorite-poster-${index + 1}.jpg`} aria-label="Download this poster" className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-gold text-brand-navy shadow-lg transition-transform hover:scale-105">
            <Download size={17} />
          </a>
          <button type="button" onClick={onClose} aria-label="Close" className="flex h-10 w-10 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur transition-colors hover:bg-white/25">
            <X size={18} />
          </button>
        </div>
        <p className="absolute -bottom-9 left-1/2 -translate-x-1/2 text-xs font-medium tabular-nums text-white/60">
          {index + 1} / {n}
        </p>
      </div>
      <div className="absolute inset-x-0 bottom-3 flex justify-center gap-6 sm:hidden">
        <button type="button" onClick={(e) => { e.stopPropagation(); go(-1); }} aria-label="Previous poster" className="flex h-10 w-10 items-center justify-center rounded-full border border-white/25 text-white"><ChevronLeft size={18} /></button>
        <button type="button" onClick={(e) => { e.stopPropagation(); go(1); }} aria-label="Next poster" className="flex h-10 w-10 items-center justify-center rounded-full border border-white/25 text-white"><ChevronRight size={18} /></button>
      </div>
    </motion.div>
  );
}

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
          <AnimatePresence>{open !== null && <Viewer posters={posters} index={open} setIndex={setOpen} onClose={() => setOpen(null)} />}</AnimatePresence>,
          document.body
        )}
    </>
  );
}
