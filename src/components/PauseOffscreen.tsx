"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

/** Looping decorations: when one is off screen it is paused, so a long page never animates dozens of things at once. */
const SELECTOR = ".particle, .ken-burns, .marquee-track, .float-y, .light-sweep, .stat-orbit, .cta-aurora, .glow-field, .glow-field-podcast, .skyline-drift, .shooting-star, .featured-spin, .seal-spin, .tile-ring, .partner-fill, .sh-glow";

export default function PauseOffscreen() {
  const path = usePathname();
  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) (e.target as HTMLElement).dataset.paused = e.isIntersecting ? "false" : "true";
      },
      { rootMargin: "120px 0px" }
    );
    const seen = new WeakSet<Element>();
    const scan = () => {
      document.querySelectorAll(SELECTOR).forEach((el) => {
        if (!seen.has(el)) {
          seen.add(el);
          io.observe(el);
        }
      });
    };
    scan();
    const t1 = window.setTimeout(scan, 800);
    const t2 = window.setTimeout(scan, 2500);
    const mo = new MutationObserver(() => scan());
    mo.observe(document.body, { childList: true, subtree: true });
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      mo.disconnect();
      io.disconnect();
    };
  }, [path]);
  return null;
}
