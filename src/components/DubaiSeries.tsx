"use client";

import Image from "next/image";
import { useRef } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ChevronLeft, ChevronRight, Download } from "lucide-react";
import ImageLightbox from "@/components/ImageLightbox";

const EASE = [0.22, 1, 0.36, 1] as const;

const SERIES = [
  { src: "/brand/series/dubai-series-1.jpg", alt: "Waterfront living in Dubai Marina" },
  { src: "/brand/series/dubai-series-2.jpg", alt: "Luxury starts here: real estate expertise" },
  { src: "/brand/series/dubai-series-3.jpg", alt: "Live the Dubai dream" },
  { src: "/brand/series/dubai-series-4.jpg", alt: "Your next address in Dubai" },
  { src: "/brand/series/dubai-series-5.jpg", alt: "Invest with confidence: book a private viewing" },
];

/** The five-part Dubai poster series: a swipeable rail of tall tiles that rise in one after another; tap one to enlarge or download it. */
export default function DubaiSeries() {
  const reduce = useReducedMotion();
  const rail = useRef<HTMLUListElement>(null);
  const nudge = (dir: 1 | -1) => rail.current?.scrollBy({ left: dir * 280, behavior: reduce ? "auto" : "smooth" });

  return (
    <div>
      <ul ref={rail} className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-4 sm:-mx-6 sm:px-6 lg:mx-0 lg:px-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {SERIES.map((p, i) => (
          <motion.li
            key={p.src}
            initial={{ opacity: 0, y: reduce ? 0 : 28, scale: reduce ? 1 : 0.96 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: 0.8, delay: i * 0.08, ease: EASE }}
            className="group/tile relative w-[44vw] min-w-[160px] max-w-[250px] flex-none snap-start overflow-hidden rounded-2xl shadow-[0_24px_50px_-28px_rgba(13,16,49,0.7)] ring-1 ring-brand-line transition-transform duration-300 hover:-translate-y-1.5 hover:ring-brand-gold/60 lg:flex-1"
          >
            <ImageLightbox src={p.src} alt={p.alt} downloadAs={`meteorite-dubai-series-${i + 1}.jpg`}>
              <span className="relative block aspect-[9/16] w-full">
                <Image src={p.src} alt={p.alt} fill sizes="(min-width: 1024px) 18vw, 44vw" className="object-cover transition-transform duration-[1200ms] ease-out group-hover/tile:scale-[1.04]" />
              </span>
            </ImageLightbox>
            <a
              href={p.src}
              download={`meteorite-dubai-series-${i + 1}.jpg`}
              aria-label={`Download: ${p.alt}`}
              title="Download"
              className="absolute bottom-2 right-2 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-white ring-1 ring-white/25 backdrop-blur transition-colors hover:bg-brand-gold hover:text-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold"
            >
              <Download size={15} />
            </a>
          </motion.li>
        ))}
      </ul>
      <div className="mt-1 flex items-center justify-between lg:hidden">
        <p className="text-xs text-brand-ink/45">5 posters · swipe →</p>
        <div className="flex gap-2">
          {([[-1, "Previous posters", ChevronLeft], [1, "Next posters", ChevronRight]] as const).map(([d, label, Icon]) => (
            <button key={label} type="button" onClick={() => nudge(d)} aria-label={label} className="flex h-9 w-9 items-center justify-center rounded-full border border-brand-line text-heading transition-colors hover:border-brand-gold hover:text-brand-gold">
              <Icon size={16} />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
