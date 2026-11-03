"use client";

import Image from "next/image";
import { developerPartners } from "@/lib/content";
import { useReducedMotion } from "framer-motion";

const FADE = "linear-gradient(90deg, transparent, black 10%, black 90%, transparent)";

function Row({ items, reverse, seconds, still }: { items: typeof developerPartners[number][]; reverse?: boolean; seconds: number; still: boolean }) {
  const track = still ? items : [...items, ...items];
  return (
    <div className="relative overflow-hidden py-2" style={{ maskImage: FADE, WebkitMaskImage: FADE }}>
      <div className={`flex w-max items-center gap-5 ${still ? "" : "marquee-track"}`} style={still ? undefined : { animationDuration: `${seconds}s`, animationDirection: reverse ? "reverse" : "normal" }}>
        {track.map((dev, i) => (
          <div
            key={`${dev.name}-${i}`}
            onPointerMove={(e) => {
              const r = e.currentTarget.getBoundingClientRect();
              e.currentTarget.style.setProperty("--mx", `${e.clientX - r.left}px`);
              e.currentTarget.style.setProperty("--my", `${e.clientY - r.top}px`);
            }}
            className="group relative flex h-24 w-44 flex-none items-center justify-center overflow-hidden rounded-2xl border border-brand-gold/15 bg-white p-6 shadow-[0_2px_10px_-4px_rgba(13,16,49,0.12)] transition-all duration-300 hover:-translate-y-1.5 hover:scale-[1.04] hover:border-brand-gold/50 hover:shadow-[0_18px_36px_-12px_rgba(219,204,59,0.45)] dark:border-white/10 dark:shadow-[0_6px_18px_-8px_rgba(0,0,0,0.6)]"
          >
            <span aria-hidden="true" className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100" style={{ background: "radial-gradient(150px circle at var(--mx, 50%) var(--my, 50%), rgba(219,204,59,0.28), transparent 70%)" }} />
            <Image src={dev.logo} alt={dev.name} width={140} height={64} className="relative h-full w-full object-contain transition-all duration-300 group-hover:scale-95 group-hover:opacity-0" />
            <span className="absolute inset-0 flex translate-y-2 items-center justify-center bg-white px-3 text-center text-xs font-semibold tracking-wide text-brand-navy opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
              {dev.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/** Two rows of developer marks drifting in opposite directions, so the strip never looks like one repeating line. */
export default function LogoMarquee() {
  const reduce = useReducedMotion() ?? false;
  const all = [...developerPartners];
  const rowA = all.filter((_, i) => i % 2 === 0);
  const rowB = all.filter((_, i) => i % 2 === 1);
  // each row needs enough marks to be wider than the panel before it is doubled
  const fill = (r: typeof all) => [...r, ...r, ...r];
  return (
    <div className="space-y-3">
      <Row items={fill(rowA)} seconds={46} still={reduce} />
      <Row items={fill(rowB)} reverse seconds={54} still={reduce} />
    </div>
  );
}
