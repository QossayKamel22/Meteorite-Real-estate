"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, LayoutGroup, motion, useReducedMotion } from "framer-motion";
import { ArrowDownUp } from "lucide-react";
import type { Property } from "@/lib/properties-data";
import PropertyCard from "@/components/PropertyCard";

type Sort = "featured" | "low" | "high";
const SORTS: { key: Sort; label: string }[] = [
  { key: "featured", label: "Featured" },
  { key: "low", label: "Price: low to high" },
  { key: "high", label: "Price: high to low" },
];

/** The listings with a type filter and a sort; cards glide to their new places when either changes. */
export default function ListingsBrowser({ properties, emptyText }: { properties: Property[]; emptyText: string }) {
  const reduce = useReducedMotion() ?? false;
  const [type, setType] = useState("All");
  const [sort, setSort] = useState<Sort>("featured");
  const types = useMemo(() => ["All", ...Array.from(new Set(properties.map((p) => p.type)))], [properties]);
  const shown = useMemo(() => {
    const list = type === "All" ? properties : properties.filter((p) => p.type === type);
    if (sort === "low") return [...list].sort((a, b) => a.price - b.price);
    if (sort === "high") return [...list].sort((a, b) => b.price - a.price);
    return list;
  }, [properties, type, sort]);

  if (properties.length === 0) {
    return <p className="rounded-3xl border border-dashed border-brand-line p-10 text-center text-sm text-brand-ink/55">{emptyText}</p>;
  }

  return (
    <LayoutGroup>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {types.length > 2 ? (
          <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by property type">
            {types.map((t) => {
              const on = t === type;
              return (
                <button
                  key={t}
                  type="button"
                  aria-pressed={on}
                  onClick={() => setType(t)}
                  className={`relative rounded-full px-4 py-1.5 text-sm font-medium ring-1 transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold ${on ? "text-brand-navy ring-brand-gold" : "text-brand-ink/70 ring-brand-line hover:text-heading hover:ring-brand-gold/50"}`}
                >
                  {on && <motion.span layoutId="type-pill" transition={{ type: "spring", stiffness: 380, damping: 30 }} className="absolute inset-0 rounded-full bg-brand-gold" />}
                  <span className="relative">{t}</span>
                </button>
              );
            })}
          </div>
        ) : (
          <span />
        )}
        <label className="flex items-center gap-2 text-sm text-brand-ink/60">
          <ArrowDownUp size={15} className="text-brand-gold" />
          <span className="sr-only">Sort listings</span>
          <select value={sort} onChange={(e) => setSort(e.target.value as Sort)} className="rounded-full border border-brand-line bg-surface px-3.5 py-1.5 text-sm font-medium text-heading outline-none transition-colors focus:border-brand-gold">
            {SORTS.map((s) => (
              <option key={s.key} value={s.key}>{s.label}</option>
            ))}
          </select>
        </label>
      </div>

      <motion.div layout={!reduce} className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        <AnimatePresence mode="popLayout">
          {shown.map((p, i) => (
            <PropertyCard key={p.id} property={p} delay={Math.min(i, 7) * 0.06} />
          ))}
        </AnimatePresence>
      </motion.div>
      {shown.length === 0 && <p className="mt-6 text-center text-sm text-brand-ink/55">Nothing of that type right now.</p>}
    </LayoutGroup>
  );
}
