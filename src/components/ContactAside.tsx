"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Check, Copy, MapPin, ShieldCheck } from "lucide-react";

const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * The right-hand column of the Contact page: the office map in a dark frame with a rippling
 * pin, the address with a one-tap copy, and the licence line. Each block slides in in turn.
 */
export default function ContactAside({ address, poBox, orn, brokerCard, mapSrc }: { address: string; poBox: string; orn: string; brokerCard: string; mapSrc: string }) {
  const reduce = useReducedMotion() ?? false;
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard blocked: the address is still selectable on screen */
    }
  }

  const slide = (i: number) => ({
    initial: { opacity: 0, x: reduce ? 0 : 50 },
    whileInView: { opacity: 1, x: 0 },
    viewport: { once: true, amount: 0.3 },
    transition: { duration: 0.9, delay: i * 0.12, ease: EASE },
  });

  return (
    <div className="space-y-5">
      <motion.div {...slide(0)} className="group relative overflow-hidden rounded-3xl border border-brand-line shadow-[0_28px_60px_-34px_rgba(13,16,49,0.6)]">
        <div className="relative h-64 sm:h-72">
          <iframe
            src={mapSrc}
            title="Meteorite Real Estate office location"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="h-full w-full transition-[filter] duration-700 [filter:grayscale(0.5)_contrast(1.05)] group-hover:[filter:grayscale(0)_contrast(1)] dark:[filter:invert(0.92)_hue-rotate(180deg)_saturate(0.7)_brightness(0.85)] dark:group-hover:[filter:invert(0.92)_hue-rotate(180deg)_saturate(0.9)_brightness(0.95)]"
          />
          <span aria-hidden="true" className="pointer-events-none absolute inset-0 bg-gradient-to-t from-brand-navy/40 via-transparent to-transparent" />
          <span aria-hidden="true" className="pointer-events-none absolute left-3 top-3 flex items-center gap-2 rounded-full bg-brand-navy/80 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-brand-gold backdrop-blur">
            <span className="relative flex h-2 w-2">
              <span className="pin-ripple absolute inline-flex h-full w-full rounded-full bg-brand-gold" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-brand-gold" />
            </span>
            Our office
          </span>
        </div>
        <div className="flex items-start gap-3 bg-brand-paper p-5">
          <MapPin size={18} className="mt-0.5 flex-none text-brand-gold" />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-brand-ink/80">{address}</p>
            <p className="mt-1 text-xs text-brand-ink/50">P.O. Box: {poBox}</p>
          </div>
          <button type="button" onClick={copy} aria-label="Copy the office address" className="flex h-9 flex-none items-center gap-1.5 rounded-full border border-brand-line px-3 text-xs font-semibold text-heading transition-colors hover:border-brand-gold hover:text-brand-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold">
            {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
            {copied ? "Copied" : "Copy"}
          </button>
        </div>
      </motion.div>

      <motion.div {...slide(1)} className="glass shimmer-border flex items-center gap-3 rounded-2xl p-5 transition-transform duration-300 hover:-translate-y-1">
        <span className="flex h-10 w-10 flex-none items-center justify-center rounded-full bg-brand-gold/15 text-brand-gold">
          <ShieldCheck size={18} strokeWidth={1.75} />
        </span>
        <p className="text-sm text-brand-ink/70">
          RERA ORN {orn} · Broker Card #{brokerCard}
        </p>
      </motion.div>
    </div>
  );
}
