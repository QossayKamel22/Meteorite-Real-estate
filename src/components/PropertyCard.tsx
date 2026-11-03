"use client";

import { useRef } from "react";
import Image from "next/image";
import { motion, useInView, useMotionValue, useReducedMotion, useSpring, useTransform } from "framer-motion";
import { ArrowUpRight, BedDouble, Bath, MapPin, Ruler } from "lucide-react";
import { isServedImage } from "@/lib/image-url";
import type { Property } from "@/lib/properties-data";
import { company } from "@/lib/content";

const EASE = [0.22, 1, 0.36, 1] as const;

function formatPrice(p: Property): { amount: string; per: string } {
  const amount = `AED ${p.price.toLocaleString()}`;
  if (p.purpose !== "rent") return { amount, per: "" };
  return { amount, per: p.rentFrequency === "monthly" ? "/ month" : "/ year" };
}

/**
 * A listing card: it rises into place, its photo is unveiled by a curtain and keeps a slow
 * zoom, the card leans toward the pointer with a gold glow beneath it, and the enquiry button
 * slides its arrow out on hover.
 */
export default function PropertyCard({ property, delay = 0, animateLayout = false }: { property: Property; delay?: number; animateLayout?: boolean }) {
  const reduce = useReducedMotion() ?? false;
  const ref = useRef<HTMLElement>(null);
  const show = useInView(ref, { once: true, amount: 0.2 });
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const rx = useSpring(useTransform(py, [-0.5, 0.5], [4, -4]), { stiffness: 200, damping: 20 });
  const ry = useSpring(useTransform(px, [-0.5, 0.5], [-5, 5]), { stiffness: 200, damping: 20 });
  const price = formatPrice(property);
  const whatsappMessage = encodeURIComponent(`Hi, I'm interested in: ${property.title} (${property.location}).`);

  return (
    <motion.div
      layout={animateLayout && !reduce}
      initial={{ opacity: 0, y: reduce ? 0 : 44, scale: reduce ? 1 : 0.95 }}
      animate={show ? { opacity: 1, y: 0, scale: 1 } : undefined}
      exit={{ opacity: 0, scale: 0.92 }}
      transition={{ duration: 0.85, delay, ease: EASE, layout: { duration: 0.5, ease: EASE } }}
      className="h-full [perspective:900px]"
    >
      <motion.article
        ref={ref}
        onPointerMove={(e) => {
          if (reduce) return;
          const r = e.currentTarget.getBoundingClientRect();
          px.set((e.clientX - r.left) / r.width - 0.5);
          py.set((e.clientY - r.top) / r.height - 0.5);
          e.currentTarget.style.setProperty("--mx", `${e.clientX - r.left}px`);
          e.currentTarget.style.setProperty("--my", `${e.clientY - r.top}px`);
        }}
        onPointerLeave={() => {
          px.set(0);
          py.set(0);
        }}
        style={reduce ? undefined : { rotateX: rx, rotateY: ry, transformStyle: "preserve-3d" }}
        className="glass shimmer-border group relative flex h-full flex-col overflow-hidden rounded-3xl transition-shadow duration-300 hover:shadow-[0_28px_60px_-28px_rgba(219,204,59,0.5)]"
      >
        <span aria-hidden="true" className="pointer-events-none absolute inset-0 z-10 opacity-0 transition-opacity duration-300 group-hover:opacity-100" style={{ background: "radial-gradient(260px circle at var(--mx, 50%) var(--my, 0%), rgba(219,204,59,0.14), transparent 65%)" }} />
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-brand-paper">
          <motion.div
            initial={{ clipPath: reduce ? "inset(0 0 0 0)" : "inset(0 0 100% 0)" }}
            animate={show ? { clipPath: "inset(0 0 0% 0)" } : undefined}
            transition={{ duration: reduce ? 0 : 1, delay: delay + 0.15, ease: EASE }}
            className="absolute inset-0"
          >
            <Image src={property.image} unoptimized={isServedImage(property.image)} alt={property.title} fill className="object-cover transition-transform duration-[1400ms] ease-out group-hover:scale-[1.08]" sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw" />
          </motion.div>
          <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-brand-navy/55 to-transparent" />
          <span className="absolute left-3 top-3 rounded-full bg-brand-navy/85 px-3 py-1 text-xs font-semibold text-white backdrop-blur">{property.type}</span>
        </div>
        <div className="relative flex flex-1 flex-col p-5">
          <p className="flex items-baseline gap-1.5">
            <span className="bg-gradient-to-r from-heading to-heading bg-clip-text text-lg font-semibold tracking-tight text-heading transition-colors duration-300 group-hover:text-gold-ink">{price.amount}</span>
            {price.per && <span className="text-xs font-medium text-brand-ink/65">{price.per}</span>}
          </p>
          <h3 className="mt-1 line-clamp-2 text-sm font-medium text-brand-ink/80">{property.title}</h3>
          <p className="mt-2 flex items-center gap-1.5 text-xs text-brand-ink/66">
            <MapPin size={12} className="flex-none text-brand-gold" />
            <span className="truncate">{property.location}</span>
          </p>

          <div className="mt-4 flex items-center gap-4 border-t border-brand-line pt-4 text-xs text-brand-ink/70">
            <span className="flex items-center gap-1.5"><BedDouble size={14} className="text-brand-gold/80" /> {property.isStudio ? "Studio" : property.bedrooms}</span>
            <span className="flex items-center gap-1.5"><Bath size={14} className="text-brand-gold/80" /> {property.bathrooms}</span>
            <span className="flex items-center gap-1.5"><Ruler size={14} className="text-brand-gold/80" /> {property.sizeSqft.toLocaleString()} sqft</span>
          </div>

          <a
            href={`https://wa.me/${company.phoneE164.replace("+", "")}?text=${whatsappMessage}`}
            target="_blank"
            rel="noopener noreferrer"
            className="group/b relative mt-5 inline-flex items-center justify-center gap-1.5 overflow-hidden rounded-full bg-brand-navy px-5 py-2.5 text-sm font-semibold text-white transition-colors duration-300 hover:bg-brand-navy-light dark:bg-white/10 dark:hover:bg-brand-gold dark:hover:text-brand-navy"
          >
            <span aria-hidden="true" className="pointer-events-none absolute inset-y-0 -left-1/2 w-1/3 -skew-x-12 bg-white/25 opacity-0 blur-[2px] transition-all duration-700 group-hover/b:left-[130%] group-hover/b:opacity-100" />
            <span className="relative">Ask about this property</span>
            <ArrowUpRight size={15} className="relative transition-transform duration-300 group-hover/b:-translate-y-0.5 group-hover/b:translate-x-0.5" />
          </a>
        </div>
      </motion.article>
    </motion.div>
  );
}
