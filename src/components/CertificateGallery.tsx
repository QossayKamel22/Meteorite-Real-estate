"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion, type PanInfo, type Variants } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { isServedImage } from "@/lib/image-url";
import ImageLightbox from "@/components/ImageLightbox";

const EASE = [0.22, 1, 0.36, 1] as const;
const SWIPE_DISTANCE = 60;
const SWIPE_VELOCITY = 400;

const slide: Variants = {
  enter: (d: number) => ({ x: d * 70, opacity: 0 }),
  center: { x: 0, opacity: 1, transition: { duration: 0.55, ease: EASE } },
  exit: (d: number) => ({ x: d * -70, opacity: 0, transition: { duration: 0.4, ease: EASE } }),
};
const calm: Variants = {
  enter: { opacity: 0 },
  center: { opacity: 1, transition: { duration: 0.2 } },
  exit: { opacity: 0, transition: { duration: 0.15 } },
};

/**
 * A certificate's image(s). One image renders as before (click to zoom). Several —
 * for example the current broker card and the earlier one it replaced — render as
 * a horizontal carousel, newest first: swipe or drag, use the arrows or dots, or
 * the keyboard arrow keys. Click (not drag) the card to zoom in.
 */
export default function CertificateGallery({ images, title }: { images: string[]; title: string }) {
  const reduce = useReducedMotion();
  const count = images.length;
  const multiple = count > 1;
  const [[index, dir], setSlide] = useState<[number, number]>([0, 1]);

  const next = useCallback(() => setSlide(([i]) => [(i + 1) % count, 1]), [count]);
  const prev = useCallback(() => setSlide(([i]) => [(i - 1 + count) % count, -1]), [count]);
  const goTo = useCallback(
    (to: number) => setSlide(([i]) => [to, to >= i ? 1 : -1]),
    []
  );

  // Warm the other cards so a swipe never waits on the network.
  useEffect(() => {
    if (!multiple) return;
    for (const src of images.slice(1)) {
      const img = new window.Image();
      img.src = src;
    }
  }, [images, multiple]);

  function onDragEnd(_: PointerEvent | MouseEvent | TouchEvent, info: PanInfo) {
    if (info.offset.x < -SWIPE_DISTANCE || info.velocity.x < -SWIPE_VELOCITY) next();
    else if (info.offset.x > SWIPE_DISTANCE || info.velocity.x > SWIPE_VELOCITY) prev();
  }

  const current = images[index] ?? images[0];
  const alt = multiple ? `${title} (${index + 1} of ${count})` : title;

  const picture = (src: string, label: string) => (
    <ImageLightbox src={src} alt={label}>
      <div className="overflow-hidden rounded-2xl">
        <Image
          src={src}
          unoptimized={isServedImage(src)}
          alt={label}
          width={1289}
          height={907}
          draggable={false}
          className="w-full select-none"
        />
      </div>
    </ImageLightbox>
  );

  if (!multiple) {
    return (
      <div className="glass shimmer-border group overflow-hidden rounded-3xl bg-white p-3 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl">
        <ImageLightbox src={current} alt={title}>
          <div className="overflow-hidden rounded-2xl">
            <Image
              src={current}
              unoptimized={isServedImage(current)}
              alt={title}
              width={1289}
              height={907}
              className="w-full transition-transform duration-500 group-hover:scale-105"
            />
          </div>
        </ImageLightbox>
      </div>
    );
  }

  return (
    <div
      role="group"
      aria-roledescription="carousel"
      aria-label={`${title}: ${count} images, newest first`}
      className="glass shimmer-border overflow-hidden rounded-3xl bg-white p-3 shadow-sm"
      onKeyDown={(e) => {
        if (e.key === "ArrowRight") next();
        if (e.key === "ArrowLeft") prev();
      }}
    >
      <div className="relative">
        <div className="grid">
          <AnimatePresence initial={false} custom={dir} mode="sync">
            <motion.div
              key={index}
              custom={dir}
              variants={reduce ? calm : slide}
              initial="enter"
              animate="center"
              exit="exit"
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.2}
              dragMomentum={false}
              onDragEnd={onDragEnd}
              style={{ touchAction: "pan-y", gridArea: "1 / 1" }}
              className="cursor-grab active:cursor-grabbing"
              aria-roledescription="slide"
              aria-label={`${index + 1} of ${count}`}
            >
              {picture(current, alt)}
            </motion.div>
          </AnimatePresence>
        </div>

        <span
          className={`pointer-events-none absolute left-3 top-3 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide shadow-sm ${
            index === 0 ? "bg-brand-gold text-brand-navy" : "bg-brand-navy/80 text-white"
          }`}
        >
          {index === 0 ? "Latest" : "Earlier"}
        </span>
      </div>

      <div className="mt-3 flex items-center gap-3 px-1">
        <span className="w-12 flex-none text-xs font-medium tabular-nums text-brand-navy/55" aria-hidden="true">
          {index + 1} / {count}
        </span>

        <div className="flex flex-1 items-center justify-center gap-1.5" role="group" aria-label="Choose an image">
          {images.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => goTo(i)}
              aria-label={`Show image ${i + 1} of ${count}${i === 0 ? " (latest)" : ""}`}
              aria-current={i === index ? "true" : undefined}
              className="flex h-6 items-center focus-visible:outline-none"
            >
              <span
                className={`block h-1.5 rounded-full transition-all duration-300 ${
                  i === index ? "w-6 bg-brand-gold" : "w-1.5 bg-brand-navy/20 hover:bg-brand-navy/40"
                }`}
              />
            </button>
          ))}
        </div>

        <div className="flex flex-none items-center gap-1.5">
          {[
            { label: "Previous image", onClick: prev, Icon: ChevronLeft },
            { label: "Next image", onClick: next, Icon: ChevronRight },
          ].map(({ label, onClick, Icon }) => (
            <button
              key={label}
              type="button"
              onClick={onClick}
              aria-label={label}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-brand-navy/10 bg-white text-brand-navy shadow-sm transition-colors hover:border-brand-gold hover:text-brand-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold"
            >
              <Icon size={17} />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
