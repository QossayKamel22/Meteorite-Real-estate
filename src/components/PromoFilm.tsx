"use client";

import { useState } from "react";
import Image from "next/image";
import { Play } from "lucide-react";
import SectionHeading from "@/components/SectionHeading";

const SRC = "/brand/video/meteorite-promo.mp4";
const POSTER = "/brand/video/meteorite-promo-poster.jpg";

/**
 * The brand film. It shows only a still until someone presses play, so the 4 MB video costs nothing
 * on page load (no `preload`, no request) and the page stays as light as before.
 */
export default function PromoFilm() {
  const [playing, setPlaying] = useState(false);

  return (
    <section aria-label="Meteorite Real Estate film" className="mx-auto max-w-5xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
      <SectionHeading kicker="Watch" title="Where do you start?" align="center" />
      <div className="relative mt-10 aspect-video overflow-hidden rounded-3xl border border-brand-line bg-brand-navy shadow-[0_30px_70px_-30px_rgba(13,16,49,0.6)]">
        {playing ? (
          <video src={SRC} poster={POSTER} controls autoPlay playsInline preload="auto" aria-label="Meteorite Real Estate: where do you start?" className="h-full w-full" />
        ) : (
          <button type="button" onClick={() => setPlaying(true)} aria-label="Play the Meteorite Real Estate film" className="group absolute inset-0 block w-full focus-visible:outline-2 focus-visible:outline-offset-[-4px] focus-visible:outline-brand-gold">
            <Image src={POSTER} alt="" fill sizes="(min-width: 1024px) 64rem, 100vw" className="object-cover transition-transform duration-700 group-hover:scale-[1.03]" />
            <span className="absolute inset-0 bg-brand-navy/25 transition-colors group-hover:bg-brand-navy/10" aria-hidden="true" />
            <span className="absolute left-1/2 top-1/2 flex h-20 w-20 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-brand-gold text-brand-navy shadow-xl transition-transform duration-300 group-hover:scale-110 sm:h-24 sm:w-24">
              <Play size={34} className="ml-1 fill-current" aria-hidden="true" />
            </span>
            <span className="absolute bottom-4 right-4 rounded-full bg-black/60 px-3 py-1 text-xs font-semibold text-white">0:32</span>
          </button>
        )}
      </div>
    </section>
  );
}
