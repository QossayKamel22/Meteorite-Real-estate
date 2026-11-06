"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { isServedImage } from "@/lib/image-url";

/**
 * The listing's photos: one large picture with arrows, keys and a strip of thumbnails. Only the visible
 * picture is loaded at full size; the strip uses small ones, and the next picture is warmed on demand.
 */
export default function PropertyGallery({ images, title, badge, badge2 }: { images: string[]; title: string; badge: string; badge2: string }) {
  const [i, setI] = useState(0);
  const n = images.length;
  const go = useCallback((d: number) => setI((v) => (v + d + n) % n), [n]);

  useEffect(() => {
    if (n < 2) return;
    const img = new window.Image();
    img.src = images[(i + 1) % n];
  }, [i, n, images]);

  return (
    <div onKeyDown={(e) => { if (e.key === "ArrowRight") go(1); if (e.key === "ArrowLeft") go(-1); }}>
      <div className="relative aspect-[16/10] overflow-hidden rounded-3xl shadow-[0_30px_70px_-30px_rgba(0,0,0,0.8)] ring-1 ring-white/15">
        {images.map((src, k) => (
          <Image
            key={src}
            src={src}
            alt={k === i ? title : ""}
            aria-hidden={k !== i}
            fill
            priority={k === 0}
            loading={k === 0 ? "eager" : "lazy"}
            sizes="(min-width: 1024px) 60vw, 100vw"
            unoptimized={isServedImage(src)}
            className={`object-cover transition-opacity duration-500 ${k === i ? "opacity-100" : "opacity-0"}`}
          />
        ))}
        <span className="absolute left-4 top-4 rounded-full bg-brand-navy/85 px-3.5 py-1 text-xs font-semibold text-white">{badge}</span>
        <span className="absolute right-4 top-4 rounded-full bg-brand-gold px-3.5 py-1 text-xs font-bold uppercase tracking-wide text-brand-navy">{badge2}</span>
        {n > 1 && (
          <>
            {([[-1, "Previous photo", ChevronLeft, "left-3"], [1, "Next photo", ChevronRight, "right-3"]] as const).map(([d, label, Icon, pos]) => (
              <button key={label} type="button" onClick={() => go(d)} aria-label={label} className={`absolute top-1/2 ${pos} flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/45 text-white transition-colors hover:bg-brand-gold hover:text-brand-navy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold`}>
                <Icon size={20} />
              </button>
            ))}
            <span className="absolute bottom-3 right-4 rounded-full bg-black/55 px-2.5 py-1 text-xs font-medium tabular-nums text-white">{i + 1} / {n}</span>
          </>
        )}
      </div>
      {n > 1 && (
        <ul className="mt-3 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {images.map((src, k) => (
            <li key={src} className="flex-none">
              <button type="button" onClick={() => setI(k)} aria-label={`Show photo ${k + 1}`} aria-current={k === i} className={`relative block h-14 w-20 overflow-hidden rounded-xl ring-2 transition-all sm:h-16 sm:w-24 ${k === i ? "ring-brand-gold" : "opacity-60 ring-transparent hover:opacity-100"}`}>
                <Image src={src} alt="" fill sizes="96px" loading="lazy" unoptimized={isServedImage(src)} className="object-cover" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
