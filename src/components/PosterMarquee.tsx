"use client";

import Image from "next/image";
import { useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, useReducedMotion } from "framer-motion";
import { isServedImage } from "@/lib/image-url";
import type { Poster } from "@/lib/poster-series-shared";
import PosterViewer from "@/components/PosterViewer";

const noSubscribe = () => () => {};

/**
 * The poster series on the homepage as a slow, self-moving band: the posters drift past
 * on their own, each tilted a little and nudged up or down in turn so the band looks
 * hand-laid rather than ruled. The band pauses under the pointer; tap a poster to open it
 * full screen. For reduced-motion visitors it is a still, swipeable row.
 */
export default function PosterMarquee({ posters }: { posters: Poster[] }) {
  const reduce = useReducedMotion();
  const [open, setOpen] = useState<number | null>(null);
  const isClient = useSyncExternalStore(noSubscribe, () => true, () => false);
  if (posters.length === 0) return null;

  // One half of the track must be wider than the screen, so repeat the set until it is.
  const reps = Math.max(1, Math.ceil(9 / posters.length));
  const half = Array.from({ length: reps }, () => posters.map((p, i) => ({ p, i }))).flat();
  const track = reduce ? half.slice(0, posters.length) : [...half, ...half];

  return (
    <>
      <div
        className="relative overflow-hidden py-6"
        style={reduce ? undefined : { maskImage: "linear-gradient(90deg, transparent, black 8%, black 92%, transparent)", WebkitMaskImage: "linear-gradient(90deg, transparent, black 8%, black 92%, transparent)" }}
      >
        <ul className={`flex w-max items-center gap-5 ${reduce ? "mx-auto overflow-x-auto px-4" : "marquee-track"}`} style={reduce ? undefined : { animationDuration: `${Math.max(36, half.length * 7)}s` }}>
          {track.map(({ p, i }, k) => (
            <li
              key={`${p.src}-${k}`}
              className="flex-none"
              style={{ transform: reduce ? undefined : `translateY(${k % 2 === 0 ? -10 : 12}px) rotate(${k % 2 === 0 ? -2.5 : 2.5}deg)` }}
              aria-hidden={k >= half.length && !reduce ? true : undefined}
            >
              <button
                type="button"
                onClick={() => setOpen(i)}
                tabIndex={k >= half.length && !reduce ? -1 : 0}
                aria-label={`Open poster ${i + 1}: ${p.alt}`}
                className="group relative block aspect-[9/16] w-[8.6rem] overflow-hidden rounded-2xl shadow-[0_22px_44px_-22px_rgba(0,0,0,0.8)] ring-1 ring-white/15 transition-transform duration-500 hover:-translate-y-2 hover:scale-[1.06] hover:ring-brand-gold/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold sm:w-[9.6rem]"
              >
                <Image src={p.src} alt="" fill sizes="160px" unoptimized={isServedImage(p.src)} className="object-cover" />
              </button>
            </li>
          ))}
        </ul>
      </div>
      {isClient &&
        createPortal(
          <AnimatePresence>{open !== null && <PosterViewer posters={posters} index={open} setIndex={setOpen} onClose={() => setOpen(null)} />}</AnimatePresence>,
          document.body
        )}
    </>
  );
}
