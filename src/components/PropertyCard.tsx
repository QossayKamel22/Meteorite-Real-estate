"use client";

import Image from "next/image";
import Link from "next/link";
import { memo } from "react";
import { ArrowUpRight, BedDouble, Bath, Check, MapPin, Ruler, Scale } from "lucide-react";
import FavoriteButton from "@/components/FavoriteButton";
import { isServedImage } from "@/lib/image-url";
import type { Property } from "@/lib/properties-data";
import { company } from "@/lib/content";

function formatPrice(p: Property): { amount: string; per: string } {
  const amount = `AED ${p.price.toLocaleString("en-US")}`;
  if (p.purpose !== "rent") return { amount, per: "" };
  return { amount, per: p.rentFrequency === "monthly" ? "/ month" : "/ year" };
}

type Props = {
  property: Property;
  /** Stagger of the entrance, in seconds. */
  delay?: number;
  /** Show the compare toggle (listing pages only). */
  comparable?: boolean;
  selected?: boolean;
  /** The compare tray is full, so unselected cards cannot be added. */
  compareDisabled?: boolean;
  onCompare?: (id: string) => void;
  /** Load the photo eagerly (first row of a list). */
  priority?: boolean;
};

/**
 * A listing card. The whole card opens the property (one link, stretched over the card); WhatsApp is the
 * single prominent action, with save and compare as small icon buttons. Entrance is plain CSS and the
 * props are all primitives, so the memo below holds while filtering or ticking compare boxes.
 */
function PropertyCardBase({ property, delay = 0, comparable = false, selected = false, compareDisabled = false, onCompare, priority = false }: Props) {
  const price = formatPrice(property);
  const perSqft = property.purpose === "sale" && property.sizeSqft > 0 ? Math.round(property.price / property.sizeSqft) : 0;
  const whatsappMessage = encodeURIComponent(`Hi, I'm interested in: ${property.title} (${property.location}).`);
  const compareBlocked = compareDisabled && !selected;

  return (
    <article style={{ "--rise-delay": `${delay}s` } as React.CSSProperties} className="card-rise group relative flex h-full flex-col overflow-hidden rounded-3xl border border-brand-line bg-surface shadow-sm transition-shadow duration-300 hover:shadow-[0_24px_50px_-28px_rgba(219,204,59,0.55)] focus-within:ring-2 focus-within:ring-brand-gold">
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-brand-paper">
        <Image
          src={property.image}
          unoptimized={isServedImage(property.image)}
          alt=""
          fill
          priority={priority}
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.05]"
          sizes="(min-width: 1280px) 25vw, (min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
        />
        <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-brand-navy/55 to-transparent" />
        <span className="absolute left-3 top-3 rounded-full bg-brand-navy/85 px-3 py-1 text-xs font-semibold text-white">{property.type}</span>
        {property.badge && (
          <span className={`absolute left-3 top-12 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider shadow-sm ${property.badge === "reduced" ? "bg-red-600 text-white" : property.badge === "exclusive" ? "bg-brand-navy text-brand-gold ring-1 ring-brand-gold/60" : "bg-brand-gold text-brand-navy"}`}>
            {property.badge === "reduced" ? "Price reduced" : property.badge === "exclusive" ? "Exclusive" : "New"}
          </span>
        )}
        {property.gallery && property.gallery.length > 0 && <span className="absolute bottom-3 left-3 rounded-full bg-black/60 px-2.5 py-1 text-[11px] font-medium text-white">+{property.gallery.length} photos</span>}
      </div>

      <div className="flex flex-1 flex-col p-5">
        <p className="flex flex-wrap items-baseline gap-x-1.5">
          <span className="text-lg font-semibold tracking-tight text-heading transition-colors duration-300 group-hover:text-gold-ink">{price.amount}</span>
          {price.per && <span className="text-xs font-medium text-brand-ink/66">{price.per}</span>}
          {perSqft > 0 && <span className="text-xs text-brand-ink/66">· AED {perSqft.toLocaleString("en-US")}/sqft</span>}
        </p>
        <h3 className="mt-1 line-clamp-2 text-sm font-medium text-brand-ink/80">
          <Link prefetch={false} href={`/property/${property.id}`} className="after:absolute after:inset-0 after:z-[5] focus-visible:outline-none">{property.title}</Link>
        </h3>
        <p className="mt-2 flex items-center gap-1.5 text-xs text-brand-ink/66">
          <MapPin size={12} aria-hidden="true" className="flex-none text-brand-gold" />
          <span className="truncate">{property.location}</span>
        </p>

        <ul className="mt-4 flex items-center gap-4 border-t border-brand-line pt-4 text-xs text-brand-ink/70">
          <li className="flex items-center gap-1.5"><BedDouble size={14} aria-hidden="true" className="text-brand-gold/80" /><span className="sr-only">Bedrooms:</span> {property.isStudio ? "Studio" : property.bedrooms}</li>
          <li className="flex items-center gap-1.5"><Bath size={14} aria-hidden="true" className="text-brand-gold/80" /><span className="sr-only">Bathrooms:</span> {property.bathrooms}</li>
          <li className="flex items-center gap-1.5"><Ruler size={14} aria-hidden="true" className="text-brand-gold/80" /><span className="sr-only">Size:</span> {property.sizeSqft.toLocaleString("en-US")} sqft</li>
        </ul>

        <div className="relative z-10 mt-auto flex items-center gap-2 pt-4">
          <a
            href={`https://wa.me/${company.phoneE164.replace("+", "")}?text=${whatsappMessage}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-11 flex-1 items-center justify-center gap-1.5 rounded-full bg-brand-navy px-5 text-sm font-semibold text-white transition-colors duration-300 hover:bg-brand-navy-light focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-gold dark:bg-white/10 dark:hover:bg-brand-gold dark:hover:text-brand-navy"
          >
            Ask about this property <ArrowUpRight size={15} aria-hidden="true" />
          </a>
          {comparable && (
            <button
              type="button"
              onClick={() => onCompare?.(property.id)}
              disabled={compareBlocked}
              aria-pressed={selected}
              aria-label={selected ? "Remove from comparison" : compareBlocked ? "Comparison is full (3 properties)" : "Add to comparison"}
              title={compareBlocked ? "You can compare up to 3 properties" : selected ? "Remove from comparison" : "Compare"}
              className={`flex h-11 w-11 flex-none items-center justify-center rounded-full ring-1 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-gold disabled:opacity-40 ${selected ? "bg-brand-gold text-brand-navy ring-brand-gold" : "text-brand-ink/70 ring-brand-line hover:ring-brand-gold"}`}
            >
              {selected ? <Check size={18} strokeWidth={3} aria-hidden="true" /> : <Scale size={18} aria-hidden="true" />}
            </button>
          )}
        </div>
      </div>

      <FavoriteButton id={property.id} className="absolute right-2 top-2 z-20 h-11 w-11 rounded-full bg-brand-navy/75 text-white hover:bg-brand-navy" />
    </article>
  );
}

/** Memoised: filtering or ticking a compare box re-renders only the cards whose own props changed. */
const PropertyCard = memo(PropertyCardBase);
export default PropertyCard;
