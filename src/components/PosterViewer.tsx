"use client";

import Image from "next/image";
import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Download, X } from "lucide-react";
import { isServedImage } from "@/lib/image-url";
import type { Poster } from "@/lib/poster-series-shared";

const EASE = [0.22, 1, 0.36, 1] as const;

/** Full-screen viewer for the posters: arrows, keys, swipe-free and one tap to close. */
export default function PosterViewer({ posters, index, setIndex, onClose }: { posters: Poster[]; index: number; setIndex: (i: number) => void; onClose: () => void }) {
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
