"use client";

import { useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { company } from "@/lib/content";

const wa = `https://wa.me/${company.phoneE164.replace("+", "")}?text=${encodeURIComponent("Hi, I'd like to talk about property in Dubai.")}`;
const WORDS = ["Where", "do you", "start?"];
const delay = (s: number) => ({ "--d": `${s}s` }) as React.CSSProperties;

/**
 * "Where do you start?": a still skyline card with a small, cheap entrance (the question rises word by word,
 * a gold line draws, the buttons settle) and one slow breathing glow. Transform/opacity CSS only, started once
 * when the section scrolls into view; reduced-motion visitors and Lite mode get it still.
 */
export default function StartHere() {
  const ref = useCallback((el: HTMLElement | null) => {
    if (!el) return;
    el.classList.add("sh-arm");
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        el.classList.add("sh-in");
        io.disconnect();
      },
      { rootMargin: "0px 0px -15% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <section ref={ref} aria-labelledby="start-here" className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
      <div className="relative isolate overflow-hidden rounded-[2rem] bg-brand-navy px-6 py-16 text-center text-white shadow-[0_40px_90px_-40px_rgba(13,16,49,0.8)] sm:px-12 sm:py-24">
        <Image src="/brand/hero/dubai-night-skyline.jpg" alt="" fill sizes="(min-width: 1152px) 72rem, 100vw" className="-z-20 object-cover opacity-45" />
        <div aria-hidden="true" className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_center,rgba(13,16,49,0.3),rgba(13,16,49,0.93)_78%)]" />
        <span aria-hidden="true" className="sh-glow absolute left-1/2 top-1/2 -z-10 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-gold/25 blur-3xl sm:h-96 sm:w-96" />

        <p className="sh-fade text-xs font-bold uppercase tracking-[0.22em] text-brand-gold sm:text-sm" style={delay(0.05)}>Trusted in the UAE since 2005</p>
        <h2 id="start-here" className="mt-5 text-4xl font-black uppercase leading-[1.05] tracking-tight sm:text-6xl">
          {WORDS.map((w, i) => (
            <span key={w} className="sh-rise-wrap mx-[0.14em] inline-block whitespace-nowrap">
              <span className="sh-rise inline-block" style={delay(0.12 + i * 0.12)}>{w}</span>
            </span>
          ))}
        </h2>
        <span aria-hidden="true" className="sh-line mx-auto mt-6 block h-1 w-24 rounded-full bg-brand-gold" style={delay(0.6)} />
        <div className="sh-fade mt-9 flex flex-wrap justify-center gap-3" style={delay(0.75)}>
          <a href={wa} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-12 items-center gap-2 rounded-full bg-brand-gold px-7 text-sm font-bold text-brand-navy transition-transform hover:scale-[1.04]">
            <MessageCircle size={17} aria-hidden="true" /> Start on WhatsApp
          </a>
          <Link prefetch={false} href="/for-sale" className="inline-flex min-h-12 items-center rounded-full border border-white/40 px-7 text-sm font-bold text-white transition-colors hover:border-brand-gold hover:text-brand-gold">
            Browse properties
          </Link>
        </div>
      </div>
    </section>
  );
}
