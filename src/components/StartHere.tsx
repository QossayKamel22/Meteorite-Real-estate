"use client";

import { useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { company } from "@/lib/content";

const wa = `https://wa.me/${company.phoneE164.replace("+", "")}?text=${encodeURIComponent("Hi, I'd like to talk about property in Dubai.")}`;
const WORDS = ["Where", "do you", "start?"];
const style = (vars: Record<string, string | number>) => vars as React.CSSProperties;
/** Fixed (not random) so the server and the browser draw the same lights. */
const DOTS = Array.from({ length: 16 }, (_, i) => ({
  x: `${(i * 37 + 8) % 96}%`,
  s: `${3 + ((i * 5) % 5)}px`,
  t: `${7 + ((i * 3) % 6)}s`,
  d: `${-((i * 1.7) % 9)}s`,
}));

/**
 * "Where do you start?": a card with a lot going on, all of it transform/opacity CSS so it stays smooth.
 * A gold light circles the border, the skyline drifts and leans toward the pointer, soft gold blobs
 * float, city lights rise, a sheen sweeps across, the headline climbs in letter by letter with a gold
 * wave running through it, and the WhatsApp button pulses. Starts when the section scrolls into view;
 * a visitor who prefers reduced motion gets the still card; phones and weak devices (Lite mode) skip the
 * decoration. Looping parts are paused off screen by PauseOffscreen.
 */
export default function StartHere() {
  const ref = useCallback((el: HTMLElement | null) => {
    if (!el) return;
    el.classList.add("sh-arm");
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        el.classList.add("sh-in");
        io.disconnect();
      },
      { rootMargin: "0px 0px -15% 0px" },
    );
    io.observe(el);

    // The scene leans toward the pointer (parallax). One rAF per move, only on devices with a real pointer.
    let raf = 0;
    function move(ev: PointerEvent) {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const r = el!.getBoundingClientRect();
        el!.style.setProperty("--px", String(Math.max(-1, Math.min(1, ((ev.clientX - r.left) / r.width - 0.5) * 2))));
        el!.style.setProperty("--py", String(Math.max(-1, Math.min(1, ((ev.clientY - r.top) / r.height - 0.5) * 2))));
      });
    }
    function leave() {
      el!.style.setProperty("--px", "0");
      el!.style.setProperty("--py", "0");
    }
    if (fine && !reduce) {
      el.addEventListener("pointermove", move);
      el.addEventListener("pointerleave", leave);
    }
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerleave", leave);
    };
  }, []);

  let letter = 0;
  return (
    <section ref={ref} aria-labelledby="start-here" className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
      {/* The rotating gold light lives in the 2px gap between this frame and the card inside it. */}
      <div className="relative isolate overflow-hidden rounded-[2rem] p-[2px] shadow-[0_40px_90px_-40px_rgba(13,16,49,0.8)]">
        <span aria-hidden="true" className="sh-ring absolute -z-10" />
        <div className="relative isolate overflow-hidden rounded-[calc(2rem-2px)] bg-brand-navy px-6 py-16 text-center text-white sm:px-12 sm:py-24">
          {/* Scene: skyline (drifts + leans), blobs, rising lights, sheen */}
          <div aria-hidden="true" className="sh-parallax absolute inset-[-4%] -z-20">
            <Image src="/brand/hero/dubai-night-skyline.jpg" alt="" fill sizes="(min-width: 1152px) 72rem, 100vw" className="sh-push object-cover opacity-45" />
          </div>
          <div aria-hidden="true" className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_center,rgba(13,16,49,0.3),rgba(13,16,49,0.93)_78%)]" />
          <span aria-hidden="true" className="sh-blob absolute -left-16 top-0 -z-10 h-72 w-72 rounded-full bg-brand-gold/25 blur-3xl" />
          <span aria-hidden="true" className="sh-blob sh-blob-b absolute -right-10 bottom-0 -z-10 h-80 w-80 rounded-full bg-brand-gold/20 blur-3xl" />
          <div aria-hidden="true" className="absolute inset-0 -z-10 overflow-hidden">
            {DOTS.map((d, i) => (
              <span key={i} className="sh-dot" style={style({ "--x": d.x, "--s": d.s, "--t": d.t, "--dl": d.d })} />
            ))}
          </div>
          <span aria-hidden="true" className="sh-shine absolute inset-y-0 -left-1/3 -z-10 w-1/3" />

          <p className="sh-fade inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.22em] text-brand-gold sm:text-sm" style={style({ "--d": "0.05s" })}>
            <span aria-hidden="true" className="sh-pulse-dot h-2 w-2 rounded-full bg-brand-gold" /> Trusted in the UAE since 2005
          </p>
          <h2 id="start-here" aria-label="Where do you start?" className="mt-5 text-4xl font-black uppercase leading-[1.05] tracking-tight sm:text-7xl">
            {WORDS.map((w, wi) => (
              <span key={w} aria-hidden="true" className="mx-[0.14em] inline-block whitespace-nowrap">
                {Array.from(w).map((ch, ci) => {
                  const i = letter++;
                  return (
                    <span key={ci} className="sh-rise-wrap inline-block">
                      <span className="sh-rise sh-letter inline-block" style={style({ "--d": `${0.12 + i * 0.04}s`, "--i": i })}>{ch === " " ? " " : ch}</span>
                    </span>
                  );
                })}
                {wi < WORDS.length - 1 && null}
              </span>
            ))}
          </h2>
          <span aria-hidden="true" className="sh-line mx-auto mt-6 block h-1 w-28 rounded-full bg-brand-gold" style={style({ "--d": "0.9s" })} />
          <div className="sh-fade mt-9 flex flex-wrap justify-center gap-3" style={style({ "--d": "1.05s" })}>
            <a href={wa} target="_blank" rel="noopener noreferrer" className="sh-cta relative inline-flex min-h-12 items-center gap-2 rounded-full bg-brand-gold px-7 text-sm font-bold text-brand-navy transition-transform hover:scale-[1.05]">
              <MessageCircle size={17} aria-hidden="true" /> Start on WhatsApp
            </a>
            <Link prefetch={false} href="/for-sale" className="inline-flex min-h-12 items-center rounded-full border border-white/40 px-7 text-sm font-bold text-white transition-colors hover:border-brand-gold hover:text-brand-gold">
              Browse properties
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
