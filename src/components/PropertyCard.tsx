"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { memo } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { ArrowRight, ArrowUpRight, BedDouble, Check, Bath, MapPin, Ruler } from "lucide-react";
import FavoriteButton from "@/components/FavoriteButton";
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
function PropertyCardBase({ property, delay = 0, compare, onCompare }: { property: Property; delay?: number; compare?: { selected: boolean; disabled: boolean }; onCompare?: (id: string) => void }) {
  const reduce = useReducedMotion() ?? false;
  const ref = useRef<HTMLElement>(null);
  const show = useInView(ref, { once: true, amount: 0.2 });
  const price = formatPrice(property);
  const whatsappMessage = encodeURIComponent(`Hi, I'm interested in: ${property.title} (${property.location}).`);

  return (
    <motion.div
      initial={{ opacity: 0, y: reduce ? 0 : 44, scale: reduce ? 1 : 0.95 }}
      animate={show ? { opacity: 1, y: 0, scale: 1 } : undefined}
      transition={{ duration: 0.7, delay, ease: EASE }}
      className="h-full"
    >
      <article
        ref={ref}
        onPointerMove={(e) => {
          if (reduce) return;
          const r = e.currentTarget.getBoundingClientRect();
          e.currentTarget.style.setProperty("--mx", `${e.clientX - r.left}px`);
          e.currentTarget.style.setProperty("--my", `${e.clientY - r.top}px`);
        }}
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
          <FavoriteButton id={property.id} className="absolute right-3 top-3 z-20 h-9 w-9 rounded-full bg-brand-navy/75 text-white backdrop-blur hover:bg-brand-navy" />
          {property.gallery && property.gallery.length > 0 && <span className="absolute bottom-3 left-3 rounded-full bg-black/55 px-2.5 py-1 text-[11px] font-medium text-white">+{property.gallery.length} photos</span>}
          <span className="pointer-events-none absolute inset-x-0 bottom-0 z-[6] flex translate-y-full items-center justify-center gap-1.5 bg-brand-gold/95 py-2 text-xs font-bold uppercase tracking-wider text-brand-navy transition-transform duration-300 group-hover:translate-y-0">
            View details <ArrowRight size={13} />
          </span>
        </div>
        <div className="relative flex flex-1 flex-col p-5">
          {compare && (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onCompare?.(property.id); }}
              disabled={compare.disabled && !compare.selected}
              aria-pressed={compare.selected}
              className={`absolute right-4 top-4 z-10 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 transition-colors disabled:opacity-40 ${compare.selected ? "bg-brand-gold text-brand-navy ring-brand-gold" : "text-brand-ink/70 ring-brand-line hover:ring-brand-gold"}`}
            >
              <span aria-hidden="true" className={`flex h-3.5 w-3.5 items-center justify-center rounded border ${compare.selected ? "border-brand-navy bg-brand-navy text-brand-gold" : "border-current"}`}>{compare.selected && <Check size={10} strokeWidth={3} />}</span>
              Compare
            </button>
          )}
          <p className="flex items-baseline gap-1.5">
            <span className="bg-gradient-to-r from-heading to-heading bg-clip-text text-lg font-semibold tracking-tight text-heading transition-colors duration-300 group-hover:text-gold-ink">{price.amount}</span>
            {price.per && <span className="text-xs font-medium text-brand-ink/65">{price.per}</span>}
          </p>
          <h3 className="mt-1 line-clamp-2 text-sm font-medium text-brand-ink/80">
            <Link prefetch={false} href={`/property/${property.id}`} className="after:absolute after:inset-0 after:z-[5] hover:text-heading focus-visible:outline-none">{property.title}</Link>
          </h3>
          <p className="mt-2 flex items-center gap-1.5 text-xs text-brand-ink/66">
            <MapPin size={12} className="flex-none text-brand-gold" />
            <span className="truncate">{property.location}</span>
          </p>

          <div className="mt-4 flex items-center gap-4 border-t border-brand-line pt-4 text-xs text-brand-ink/70">
            <span className="flex items-center gap-1.5"><BedDouble size={14} className="text-brand-gold/80" /> {property.isStudio ? "Studio" : property.bedrooms}</span>
            <span className="flex items-center gap-1.5"><Bath size={14} className="text-brand-gold/80" /> {property.bathrooms}</span>
            <span className="flex items-center gap-1.5"><Ruler size={14} className="text-brand-gold/80" /> {property.sizeSqft.toLocaleString()} sqft</span>
          </div>

          <Link prefetch={false} href={`/property/${property.id}`} className="relative z-10 mt-4 inline-flex items-center gap-1 self-start text-sm font-semibold text-gold-ink hover:underline">
            View full details <ArrowRight size={14} className="transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
          <a
            href={`https://wa.me/${company.phoneE164.replace("+", "")}?text=${whatsappMessage}`}
            target="_blank"
            rel="noopener noreferrer"
            className="group/b relative z-10 mt-4 inline-flex items-center justify-center gap-1.5 overflow-hidden rounded-full bg-brand-navy px-5 py-2.5 text-sm font-semibold text-white transition-colors duration-300 hover:bg-brand-navy-light dark:bg-white/10 dark:hover:bg-brand-gold dark:hover:text-brand-navy"
          >
            <span aria-hidden="true" className="pointer-events-none absolute inset-y-0 -left-1/2 w-1/3 -skew-x-12 bg-white/25 opacity-0 blur-[2px] transition-all duration-700 group-hover/b:left-[130%] group-hover/b:opacity-100" />
            <span className="relative">Ask about this property</span>
            <ArrowUpRight size={15} className="relative transition-transform duration-300 group-hover/b:-translate-y-0.5 group-hover/b:translate-x-0.5" />
          </a>
        </div>
      </article>
    </motion.div>
  );
}

/** Memoised: filtering or ticking a compare box re-renders only the cards whose own data changed. */
const PropertyCard = memo(PropertyCardBase);
export default PropertyCard;
