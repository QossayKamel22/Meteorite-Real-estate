"use client";

import { useCallback } from "react";

/** One observer shared by every Reveal on the page (instead of one per element). */
let shared: IntersectionObserver | null = null;
function observer(): IntersectionObserver {
  if (!shared) {
    shared = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          e.target.classList.add("is-in");
          shared?.unobserve(e.target);
        }
      },
      { rootMargin: "0px 0px -80px 0px" },
    );
  }
  return shared;
}

/**
 * Fades and lifts its content into place the first time it scrolls into view. Same look as before
 * (see .reveal in globals.css), but it is plain CSS on opacity/transform driven by a single shared
 * IntersectionObserver, so it costs no animation-engine work per element.
 */
export default function Reveal({
  children,
  delay = 0,
  className,
  y = 22,
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
  y?: number;
}) {
  const ref = useCallback((el: HTMLDivElement | null) => {
    if (!el) return;
    const io = observer();
    io.observe(el);
    return () => io.unobserve(el);
  }, []);

  return (
    <div ref={ref} className={className ? `reveal ${className}` : "reveal"} style={{ "--reveal-y": `${y}px`, "--reveal-delay": `${delay}s` } as React.CSSProperties}>
      {children}
    </div>
  );
}
