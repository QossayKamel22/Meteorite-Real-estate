"use client";

import { useEffect, useState } from "react";
import { Sparkles, Zap } from "lucide-react";

const KEY = "meteorite:lite";

type Nav = Navigator & { deviceMemory?: number; connection?: { saveData?: boolean; effectiveType?: string } };

/** Marks the page for "lite" effects (see globals.css): no frosted blur, no looping decorations. */
function apply(on: boolean) {
  document.documentElement.dataset.lite = on ? "true" : "false";
}

/**
 * Smooth mode. On a device that looks weak (little memory, few cores, data saver, slow network) or that
 * measurably drops frames while the page loads, the heavy decoration is switched off by itself. Anyone can
 * override it with the toggle in the footer; the choice is remembered on that device.
 */
export default function LiteMode() {
  useEffect(() => {
    let stored: string | null = null;
    try {
      stored = localStorage.getItem(KEY);
    } catch {
      /* private mode: just decide from the device */
    }
    if (stored === "on" || stored === "off") {
      apply(stored === "on");
      return;
    }
    const n = navigator as Nav;
    const weak =
      n.connection?.saveData === true ||
      (n.deviceMemory !== undefined && n.deviceMemory <= 4) ||
      (navigator.hardwareConcurrency !== undefined && navigator.hardwareConcurrency <= 4) ||
      n.connection?.effectiveType === "2g" ||
      n.connection?.effectiveType === "slow-2g";
    if (weak) {
      apply(true);
      return;
    }
    apply(false);
    // Otherwise watch the first few seconds: if the page cannot hold ~30 fps, simplify it.
    let raf = 0;
    let last = 0;
    let slow = 0;
    let frames = 0;
    const t0 = performance.now() + 2500; // let loading settle first
    const tick = (now: number) => {
      if (now > t0) {
        if (last) {
          frames++;
          if (now - last > 40) slow++;
        }
        last = now;
        if (frames >= 90) {
          if (slow / frames > 0.35) apply(true);
          return;
        }
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);
  return null;
}

/** The footer switch. */
export function LiteToggle() {
  const [on, setOn] = useState(false);
  useEffect(() => {
    const read = () => setOn(document.documentElement.dataset.lite === "true");
    read();
    const t = window.setInterval(read, 1500);
    return () => window.clearInterval(t);
  }, []);
  function flip() {
    const next = !on;
    apply(next);
    setOn(next);
    try {
      localStorage.setItem(KEY, next ? "on" : "off");
    } catch {
      /* ignore */
    }
  }
  return (
    <button type="button" onClick={flip} aria-pressed={on} className="inline-flex items-center gap-1.5 rounded-full border border-white/15 px-3 py-1 text-xs font-medium text-white/60 transition-colors hover:border-brand-gold/60 hover:text-white">
      {on ? <Zap size={12} className="text-brand-gold" /> : <Sparkles size={12} className="text-brand-gold" />}
      {on ? "Smooth mode: on" : "Effects: on"}
    </button>
  );
}
