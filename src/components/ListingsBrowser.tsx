"use client";

import { useCallback, useDeferredValue, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Scale, Search, SlidersHorizontal, X } from "lucide-react";
import type { Property } from "@/lib/properties-data";
import { isServedImage } from "@/lib/image-url";
import PropertyCard from "@/components/PropertyCard";

type Sort = "featured" | "low" | "high" | "size";
const SORTS: { key: Sort; label: string }[] = [
  { key: "featured", label: "Featured" },
  { key: "low", label: "Price: low to high" },
  { key: "high", label: "Price: high to low" },
  { key: "size", label: "Largest first" },
];
const BEDS = ["Any", "Studio", "1", "2", "3", "4+"] as const;
const MAX_COMPARE = 3;

const money = (p: Property) => `AED ${p.price.toLocaleString("en-US")}${p.purpose === "rent" ? (p.rentFrequency === "monthly" ? " /mo" : " /yr") : ""}`;

/** Compares up to three listings side by side. */
function CompareModal({ items, onClose, onRemove }: { items: Property[]; onClose: () => void; onRemove: (id: string) => void }) {
  const rows: { label: string; get: (p: Property) => string }[] = [
    { label: "Price", get: money },
    { label: "Type", get: (p) => p.type },
    { label: "Bedrooms", get: (p) => (p.isStudio ? "Studio" : String(p.bedrooms)) },
    { label: "Bathrooms", get: (p) => String(p.bathrooms) },
    { label: "Size", get: (p) => `${p.sizeSqft.toLocaleString("en-US")} sqft` },
    { label: "Price / sqft", get: (p) => `AED ${Math.round(p.price / Math.max(1, p.sizeSqft)).toLocaleString("en-US")}` },
    { label: "Location", get: (p) => p.location },
  ];
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-end justify-center bg-[#05061a]/85 p-0 backdrop-blur-sm sm:items-center sm:p-6" onClick={onClose} role="dialog" aria-modal="true" aria-label="Compare properties">
      <motion.div initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 30, opacity: 0 }} transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }} onClick={(e) => e.stopPropagation()} className="max-h-[90vh] w-full max-w-4xl overflow-auto rounded-t-3xl bg-surface p-5 shadow-2xl sm:rounded-3xl sm:p-7">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-heading">Compare properties</h2>
          <button type="button" onClick={onClose} aria-label="Close" className="flex h-9 w-9 items-center justify-center rounded-full text-brand-ink/66 hover:bg-brand-paper"><X size={18} /></button>
        </div>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[34rem] border-separate border-spacing-0 text-left text-sm">
            <thead>
              <tr>
                <th className="w-28" />
                {items.map((p) => (
                  <th key={p.id} className="px-2 pb-3 align-top">
                    <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-brand-paper">
                      <Image src={p.image} alt={p.title} fill sizes="240px" unoptimized={isServedImage(p.image)} className="object-cover" />
                      <button type="button" onClick={() => onRemove(p.id)} aria-label={`Remove ${p.title}`} className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white hover:bg-red-600"><X size={12} /></button>
                    </div>
                    <Link prefetch={false} href={`/property/${p.id}`} className="mt-2 line-clamp-2 block text-sm font-semibold text-heading hover:text-gold-ink">{p.title}</Link>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => {
                const vals = items.map(r.get);
                const best = r.label === "Price / sqft" ? Math.min(...items.map((p) => p.price / Math.max(1, p.sizeSqft))) : null;
                return (
                  <tr key={r.label} className="border-t border-brand-line">
                    <th scope="row" className="border-t border-brand-line py-2.5 pr-2 text-xs font-semibold uppercase tracking-wide text-brand-ink/66">{r.label}</th>
                    {vals.map((v, i) => (
                      <td key={i} className={`border-t border-brand-line px-2 py-2.5 text-brand-ink/85 ${best !== null && Math.abs(items[i].price / Math.max(1, items[i].sizeSqft) - best) < 0.001 && items.length > 1 ? "font-semibold text-emerald-600" : ""}`}>{v}</td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </motion.div>
    </motion.div>
  );
}

/**
 * The listings with one calm filter bar: search, type, price and sort in a row of fields, bedrooms as a
 * single segmented control, and a compare tray (up to three). It all runs in the browser on the listings
 * already on the page, so it adds no requests; typing is deferred and the cards are memoised, so
 * filtering never makes the page stutter.
 */
export default function ListingsBrowser({ properties, emptyText }: { properties: Property[]; emptyText: string }) {
  const [type, setType] = useState("All");
  const [beds, setBeds] = useState<(typeof BEDS)[number]>("Any");
  const [q, setQ] = useState("");
  const [maxPrice, setMaxPrice] = useState(0);
  const [sort, setSort] = useState<Sort>("featured");
  const [picked, setPicked] = useState<string[]>([]);
  const [showCompare, setShowCompare] = useState(false);
  const [more, setMore] = useState(false);
  const deferredQ = useDeferredValue(q);

  const types = useMemo(() => Array.from(new Set(properties.map((p) => p.type))), [properties]);
  const prices = useMemo(() => {
    const top = Math.max(0, ...properties.map((p) => p.price));
    if (top === 0) return [];
    const step = Math.pow(10, Math.max(4, String(Math.round(top)).length - 2));
    return Array.from({ length: 6 }, (_, i) => Math.ceil((top * (i + 1)) / 6 / step) * step).filter((v, i, a) => a.indexOf(v) === i);
  }, [properties]);

  const shown = useMemo(() => {
    const needle = deferredQ.trim().toLowerCase();
    let list = properties.filter((p) => {
      if (type !== "All" && p.type !== type) return false;
      if (beds === "Studio" && !p.isStudio) return false;
      if (beds === "4+" && (p.isStudio || p.bedrooms < 4)) return false;
      if (beds !== "Any" && beds !== "Studio" && beds !== "4+" && (p.isStudio || p.bedrooms !== Number(beds))) return false;
      if (maxPrice && p.price > maxPrice) return false;
      if (needle && !`${p.title} ${p.location} ${p.type}`.toLowerCase().includes(needle)) return false;
      return true;
    });
    if (sort === "low") list = [...list].sort((a, b) => a.price - b.price);
    if (sort === "high") list = [...list].sort((a, b) => b.price - a.price);
    if (sort === "size") list = [...list].sort((a, b) => b.sizeSqft - a.sizeSqft);
    return list;
  }, [properties, type, beds, maxPrice, deferredQ, sort]);

  const toggleCompare = useCallback((id: string) => setPicked((c) => (c.includes(id) ? c.filter((x) => x !== id) : c.length >= MAX_COMPARE ? c : [...c, id])), []);
  const chosen = picked.map((id) => properties.find((p) => p.id === id)).filter((p): p is Property => Boolean(p));
  const filtered = type !== "All" || beds !== "Any" || maxPrice > 0 || q.trim() !== "";
  const full = picked.length >= MAX_COMPARE;

  if (properties.length === 0) {
    return <p className="rounded-3xl border border-dashed border-brand-line p-10 text-center text-sm text-brand-ink/66">{emptyText}</p>;
  }

  const field = "w-full rounded-xl border border-brand-line bg-surface px-3 py-2.5 text-sm font-medium text-heading outline-none transition-colors focus:border-brand-gold";

  return (
    <>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <label className="relative block flex-1">
          <Search size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-ink/45" />
          <span className="sr-only">Search listings</span>
          <input value={q} onChange={(e) => setQ(e.target.value)} type="search" placeholder="Search by area or building" className={`${field} pl-10 font-normal`} />
        </label>
        <div className="flex items-center gap-2">
          <div role="group" aria-label="Bedrooms" className="flex flex-1 overflow-hidden rounded-xl border border-brand-line bg-surface sm:flex-none">
            {BEDS.map((b) => (
              <button key={b} type="button" aria-pressed={b === beds} onClick={() => setBeds(b)} className={`flex-1 px-3 py-2.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand-gold sm:flex-none ${b === beds ? "bg-brand-gold text-brand-navy" : "text-brand-ink/72 hover:bg-brand-paper hover:text-heading"}`}>
                {b === "Any" ? "All" : b}
              </button>
            ))}
          </div>
          <button type="button" onClick={() => setMore((v) => !v)} aria-expanded={more} aria-label="More filters" className={`flex h-[2.6rem] w-[2.6rem] flex-none items-center justify-center rounded-xl border transition-colors ${more || type !== "All" || maxPrice > 0 || sort !== "featured" ? "border-brand-gold bg-brand-gold/15 text-gold-ink" : "border-brand-line bg-surface text-brand-ink/70 hover:border-brand-gold"}`}>
            <SlidersHorizontal size={17} />
          </button>
        </div>
      </div>
      {more && (
        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          {types.length > 1 && (
            <select aria-label="Property type" value={type} onChange={(e) => setType(e.target.value)} className={field}>
              <option value="All">All types</option>
              {types.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          )}
          {prices.length > 0 && (
            <select aria-label="Maximum price" value={maxPrice} onChange={(e) => setMaxPrice(Number(e.target.value))} className={field}>
              <option value={0}>Any price</option>
              {prices.map((v) => <option key={v} value={v}>Up to AED {v.toLocaleString("en-US")}</option>)}
            </select>
          )}
          <select aria-label="Sort listings" value={sort} onChange={(e) => setSort(e.target.value as Sort)} className={field}>
            {SORTS.map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}
          </select>
        </div>
      )}
      <div className="mt-3 flex items-center justify-between text-xs text-brand-ink/60" aria-live="polite">
        <span>{shown.length} of {properties.length} listing{properties.length === 1 ? "" : "s"}</span>
        {(filtered || sort !== "featured") && <button type="button" onClick={() => { setType("All"); setBeds("Any"); setMaxPrice(0); setQ(""); setSort("featured"); }} className="text-sm font-semibold text-gold-ink underline">Clear filters</button>}
      </div>

      <div className="mt-4 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {shown.map((p, i) => (
          <PropertyCard key={p.id} property={p} delay={Math.min(i, 7) * 0.05} compare={{ selected: picked.includes(p.id), disabled: full }} onCompare={toggleCompare} />
        ))}
      </div>
      {shown.length === 0 && <p className="mt-6 rounded-3xl border border-dashed border-brand-line p-8 text-center text-sm text-brand-ink/66">Nothing matches those filters. Try widening them.</p>}

      <AnimatePresence>
        {picked.length > 0 && (
          <motion.div initial={{ y: 80, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 80, opacity: 0 }} transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }} className="fixed inset-x-0 bottom-4 z-40 mx-auto flex w-fit max-w-[92vw] items-center gap-3 rounded-full bg-brand-navy px-4 py-2.5 text-white shadow-[0_20px_50px_-15px_rgba(0,0,0,0.7)] ring-1 ring-brand-gold/40">
            <Scale size={16} className="text-brand-gold" />
            <span className="text-sm font-medium">{picked.length} selected</span>
            <button type="button" disabled={picked.length < 2} onClick={() => setShowCompare(true)} className="rounded-full bg-brand-gold px-4 py-1.5 text-sm font-semibold text-brand-navy disabled:opacity-40">{picked.length < 2 ? "Pick one more" : "Compare"}</button>
            <button type="button" onClick={() => setPicked([])} aria-label="Clear selection" className="flex h-7 w-7 items-center justify-center rounded-full text-white/70 hover:bg-white/10"><X size={14} /></button>
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {showCompare && chosen.length >= 2 && <CompareModal items={chosen} onClose={() => setShowCompare(false)} onRemove={(id) => { setPicked((c) => c.filter((x) => x !== id)); if (picked.length <= 2) setShowCompare(false); }} />}
      </AnimatePresence>
    </>
  );
}
