"use client";

import { useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, MessageCircle } from "lucide-react";
import { company, developerPartners } from "@/lib/content";

const WORDS = ["Buy", "Sell", "Lease", "Mortgage", "Manage"];
/** The odometer lands on 2005: the strip is 0-9 twice, so these are the row each digit stops on. */
const YEAR_ROWS = [12, 10, 10, 15];
const DIGITS = Array.from({ length: 20 }, (_, i) => i % 10);
const wa = `https://wa.me/${company.phoneE164.replace("+", "")}?text=${encodeURIComponent("Hi, I'd like to talk about property in Dubai.")}`;

/**
 * "Where do you start?": a live, animated answer to the question. The headline rises word by word, the
 * services cycle, a year odometer rolls to 2005, the credentials arrive and the developers scroll past.
 * Pure CSS animation (see .sh-* in globals.css) started once by one IntersectionObserver; nothing loads
 * or runs until the section is on screen, and reduced-motion visitors get the finished state.
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
    <section ref={ref} aria-label="Where do you start?" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
      <div className="overflow-hidden rounded-[2rem] shadow-[0_40px_90px_-40px_rgba(13,16,49,0.7)]">
        <div className="grid lg:grid-cols-[1.1fr_0.9fr]">
          {/* Left: the question and the answer */}
          <div className="flex flex-col justify-between bg-brand-gold p-8 text-brand-navy sm:p-12">
            <div>
              <p className="sh-rise-wrap text-xs font-black uppercase tracking-[0.2em]"><span className="sh-rise" style={{ "--d": "0s" } as React.CSSProperties}>Dubai property, simply</span></p>
              <h2 className="mt-5 text-5xl font-black uppercase leading-[0.95] tracking-tight sm:text-7xl">
                {["Where", "do you", "start?"].map((line, i) => (
                  <span key={line} className="sh-rise-wrap block">
                    <span className="sh-rise block" style={{ "--d": `${0.1 + i * 0.12}s` } as React.CSSProperties}>{line}</span>
                  </span>
                ))}
              </h2>
              <div className="mt-8 flex items-baseline gap-3 text-3xl font-black uppercase sm:text-5xl">
                <span className="sh-fade" style={{ "--d": "0.55s" } as React.CSSProperties}>You can</span>
                <span className="sh-cycle" aria-hidden="true">
                  <span className="sh-cycle-list">
                    {[...WORDS, WORDS[0]].map((w, i) => <span key={i} className="sh-cycle-item">{w}</span>)}
                  </span>
                </span>
              </div>
              <p className="sr-only">Buy, sell, lease, mortgage and manage property with Meteorite Real Estate.</p>
            </div>
            <div className="sh-fade mt-10 flex flex-wrap gap-3" style={{ "--d": "0.8s" } as React.CSSProperties}>
              <a href={wa} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-12 items-center gap-2 rounded-full bg-brand-navy px-6 text-sm font-bold text-white transition-transform hover:scale-[1.03]">
                <MessageCircle size={17} aria-hidden="true" /> Start on WhatsApp
              </a>
              <Link prefetch={false} href="/for-sale" className="inline-flex min-h-12 items-center gap-2 rounded-full border-2 border-brand-navy px-6 text-sm font-bold transition-colors hover:bg-brand-navy hover:text-white">
                Browse properties <ArrowRight size={16} aria-hidden="true" />
              </Link>
            </div>
          </div>

          {/* Right: the proof, over the skyline */}
          <div className="relative isolate min-h-[28rem] overflow-hidden bg-brand-navy text-white">
            <Image src="/brand/hero/dubai-night-skyline.jpg" alt="" fill sizes="(min-width: 1024px) 40vw, 100vw" className="sh-push -z-20 object-cover" />
            <div aria-hidden="true" className="absolute inset-0 -z-10 bg-brand-navy/70" />
            <div className="flex h-full flex-col justify-center gap-8 p-8 sm:p-12">
              <div>
                <p className="sh-fade text-xs font-bold uppercase tracking-[0.2em] text-white/80" style={{ "--d": "0.3s" } as React.CSSProperties}>Brokerage in the UAE since</p>
                <p className="sh-odo mt-1 flex font-black leading-none text-brand-gold" style={{ fontSize: "clamp(5rem, 11vw, 8rem)" }} aria-label="2005">
                  {YEAR_ROWS.map((row, i) => (
                    <span key={i} aria-hidden="true" className="sh-odo-win">
                      <span className="sh-odo-strip" style={{ "--t": row, "--d": `${0.4 + i * 0.1}s` } as React.CSSProperties}>
                        {DIGITS.map((d, j) => <span key={j} className="sh-odo-d">{d}</span>)}
                      </span>
                    </span>
                  ))}
                </p>
              </div>
              <ul className="space-y-3 text-sm font-semibold sm:text-base">
                <li className="sh-fade flex items-center gap-3" style={{ "--d": "1.1s" } as React.CSSProperties}><span className="h-2.5 w-2.5 flex-none rounded-full bg-brand-gold" /> RERA &amp; Dubai Land Department certified</li>
                <li className="sh-fade flex items-center gap-3" style={{ "--d": "1.25s" } as React.CSSProperties}><span className="h-2.5 w-2.5 flex-none rounded-full bg-brand-gold" /> ORN {company.orn}</li>
                <li className="sh-fade flex items-center gap-3" style={{ "--d": "1.4s" } as React.CSSProperties}><span className="h-2.5 w-2.5 flex-none rounded-full bg-brand-gold" /> Broker Card #{company.brokerCard}</li>
              </ul>
            </div>
          </div>
        </div>

        {/* The developers we are registered with, scrolling past */}
        <div className="overflow-hidden bg-brand-navy py-4 text-white" aria-label={`Registered with ${developerPartners.map((d) => d.name).join(", ")}`}>
          <div className="sh-marquee flex w-max whitespace-nowrap text-sm font-black uppercase tracking-[0.18em]" aria-hidden="true">
            {[0, 1].map((k) => (
              <div key={k} className="flex gap-12 pr-12">
                <span className="text-brand-gold">Registered with</span>
                {developerPartners.map((d) => <span key={d.name}>{d.name}</span>)}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
