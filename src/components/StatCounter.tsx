"use client";

import { useEffect, useRef, useState } from "react";
import { Building2, Trophy, Users, Smile } from "lucide-react";

const RADIUS = 26;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

const ICONS = { building: Building2, users: Users, trophy: Trophy, smile: Smile } as const;
export type StatIconKey = keyof typeof ICONS;

export default function StatCounter({ value, icon }: { value: number; icon?: StatIconKey }) {
  const Icon = icon ? ICONS[icon] : undefined;
  const [display, setDisplay] = useState(0);
  const [progress, setProgress] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time reduced-motion check, not derived from props/state
      setDisplay(value);
      setProgress(1);
      return;
    }

    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        const duration = 1100;
        const start = performance.now();

        function tick(now: number) {
          const raw = Math.min((now - start) / duration, 1);
          const eased = 1 - Math.pow(1 - raw, 3);
          setDisplay(Math.round(eased * value));
          setProgress(eased);
          if (raw < 1) requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);
        observer.disconnect();
      },
      { threshold: 0.4 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [value]);

  return (
    <div ref={ref} className="flex flex-col items-center">
      <div className="relative flex h-16 w-16 items-center justify-center">
        <svg viewBox="0 0 60 60" className="absolute inset-0 -rotate-90">
          <circle cx="30" cy="30" r={RADIUS} fill="none" strokeWidth="3" className="stroke-brand-line" />
          <circle
            cx="30"
            cy="30"
            r={RADIUS}
            fill="none"
            strokeWidth="3"
            strokeLinecap="round"
            className="stroke-brand-gold"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={CIRCUMFERENCE * (1 - progress)}
          />
        </svg>
        {Icon && <Icon size={22} strokeWidth={1.75} className="text-brand-gold" />}
      </div>
      <p className="mt-3 text-3xl font-semibold tracking-tight text-heading sm:text-4xl">
        {display.toLocaleString()}+
      </p>
    </div>
  );
}
