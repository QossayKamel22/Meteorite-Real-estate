"use client";

import { useId, useRef, useState } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { Quote, Star } from "lucide-react";
import type { Testimonial } from "@/lib/testimonials-data";
import ReviewAvatar from "@/components/ReviewAvatar";
import GoogleMark from "@/components/GoogleMark";

// Quotes longer than this are cut to a few lines with a "Read more" toggle, so a
// 1,000-character review doesn't turn the grid into a wall of text.
const LONG_QUOTE = 190;

function StarRow({ rating, show }: { rating: number; show: boolean }) {
  const reduce = useReducedMotion();
  return (
    <div className="flex items-center gap-0.5" aria-label={`${rating} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <motion.span
          key={n}
          aria-hidden="true"
          initial={{ opacity: reduce ? 1 : 0, scale: reduce ? 1 : 0.3, rotate: reduce ? 0 : -40 }}
          animate={show ? { opacity: 1, scale: 1, rotate: 0 } : undefined}
          transition={{ type: "spring", stiffness: 320, damping: 14, delay: 0.15 + n * 0.08 }}
        >
          <Star size={14} className="text-brand-gold" fill={n <= rating ? "currentColor" : "none"} strokeWidth={1.5} />
        </motion.span>
      ))}
    </div>
  );
}

function GoogleBadge() {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-2.5 py-1 text-[10px] font-semibold text-brand-ink/60 shadow-sm ring-1 ring-black/5 dark:bg-white/10 dark:text-white/75 dark:shadow-none dark:ring-white/15">
      <GoogleMark />
      Google Review
    </span>
  );
}

export default function ReviewCard({ t }: { t: Testimonial }) {
  const [open, setOpen] = useState(false);
  const quoteId = useId();
  const isLong = t.quote.length > LONG_QUOTE;
  const ref = useRef<HTMLElement>(null);
  const show = useInView(ref, { once: true, amount: 0.4 });
  const reduce = useReducedMotion();

  return (
    <figure
      ref={ref}
      onPointerMove={(e) => {
        if (reduce) return;
        const r = e.currentTarget.getBoundingClientRect();
        e.currentTarget.style.setProperty("--mx", `${e.clientX - r.left}px`);
        e.currentTarget.style.setProperty("--my", `${e.clientY - r.top}px`);
      }}
      className="glass shimmer-border group relative flex h-full flex-col overflow-hidden rounded-3xl p-6 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl"
    >
      <span aria-hidden="true" className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100" style={{ background: "radial-gradient(260px circle at var(--mx, 50%) var(--my, 0%), rgba(219,204,59,0.16), transparent 65%)" }} />
      <span aria-hidden="true" className="pointer-events-none absolute inset-x-6 top-0 h-px origin-left scale-x-0 bg-gradient-to-r from-transparent via-brand-gold to-transparent transition-transform duration-700 group-hover:scale-x-100" />
      <Quote
        size={64}
        strokeWidth={1}
        className="pointer-events-none absolute -right-2 -top-2 text-brand-gold/10 transition-transform duration-300 group-hover:scale-110"
      />
      <div className="relative flex items-center justify-between gap-2">
        <StarRow rating={t.rating ?? 5} show={show} />
        {t.source === "google" && <GoogleBadge />}
      </div>
      <blockquote
        id={quoteId}
        className={`relative mt-4 text-[15px] leading-relaxed text-brand-ink/80 ${isLong && !open ? "line-clamp-4" : ""}`}
      >
        &ldquo;{t.quote}&rdquo;
      </blockquote>
      {isLong && (
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls={quoteId}
          className="relative mt-2 self-start text-sm font-semibold text-[#8a7b00] hover:underline dark:text-brand-gold"
        >
          {open ? "Show less" : "Read more"}
        </button>
      )}
      <figcaption className="relative mt-auto flex items-center gap-3 pt-5">
        <ReviewAvatar name={t.name} size="md" />
        <span>
          <span className="block text-sm font-semibold text-heading">{t.name}</span>
          <span className="block text-xs font-normal text-brand-ink/50">{t.role}</span>
        </span>
      </figcaption>
    </figure>
  );
}
