import Image from "next/image";
import { BedDouble, Bath, MapPin, Ruler } from "lucide-react";
import type { Property } from "@/lib/properties-data";
import { company } from "@/lib/content";
import Reveal from "@/components/Reveal";

function formatPrice(p: Property): string {
  const amount = `AED ${p.price.toLocaleString()}`;
  if (p.purpose !== "rent") return amount;
  return `${amount} / ${p.rentFrequency === "monthly" ? "month" : "year"}`;
}

export default function PropertyCard({ property, delay = 0 }: { property: Property; delay?: number }) {
  const whatsappMessage = encodeURIComponent(
    `Hi, I'm interested in: ${property.title} (${property.location}).`
  );

  return (
    <Reveal delay={delay}>
      <article className="glass shimmer-border group flex h-full flex-col overflow-hidden rounded-2xl">
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-brand-paper">
          <Image
            src={property.image}
            alt={property.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
          />
          <span className="absolute left-3 top-3 rounded-full bg-brand-navy/85 px-3 py-1 text-xs font-semibold text-white backdrop-blur">
            {property.type}
          </span>
        </div>
        <div className="flex flex-1 flex-col p-5">
          <p className="text-lg font-semibold tracking-tight text-heading">{formatPrice(property)}</p>
          <h3 className="mt-1 line-clamp-2 text-sm font-medium text-brand-ink/80">{property.title}</h3>
          <p className="mt-2 flex items-center gap-1.5 text-xs text-brand-ink/55">
            <MapPin size={12} className="flex-none" />
            <span className="truncate">{property.location}</span>
          </p>

          <div className="mt-4 flex items-center gap-4 text-xs text-brand-ink/60">
            <span className="flex items-center gap-1.5">
              <BedDouble size={14} /> {property.isStudio ? "Studio" : property.bedrooms}
            </span>
            <span className="flex items-center gap-1.5">
              <Bath size={14} /> {property.bathrooms}
            </span>
            <span className="flex items-center gap-1.5">
              <Ruler size={14} /> {property.sizeSqft.toLocaleString()} sqft
            </span>
          </div>

          <a
            href={`https://wa.me/${company.phoneE164.replace("+", "")}?text=${whatsappMessage}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-5 inline-flex items-center justify-center rounded-full bg-brand-navy px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-navy-light"
          >
            Ask about this property
          </a>
        </div>
      </article>
    </Reveal>
  );
}
