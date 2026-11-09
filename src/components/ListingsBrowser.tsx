"use client";

import { useCallback, useDeferredValue, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { MessageCircle, Scale, Search, SlidersHorizontal, X } from "lucide-react";
import type { Property } from "@/lib/properties-data";
import { isServedImage } from "@/lib/image-url";
import HelpMeChoose from "@/components/HelpMeChoose";
import PropertyCard from "@/components/PropertyCard";
import { company } from "@/lib/content";
import { useDialog } from "@/lib/use-dialog";

type Sort = "featured" | "low" | "high" | "size";
const SORTS: { key: Sort; label: string }[] = [
  { key: "featured", label: "Featured" },
  { key: "low", label: "Price: low to high" },
  { key: "high", label: "Price: high to low" },
  { key: "size", label: "Largest first" },
];
const BEDS = ["Any", "Studio", "1", "2", "3", "4+"] as const;
const MAX_COMPARE = 3;
const SORT_KEYS = SORTS.map((s) => s.key);

type Filters = { type: string; beds: (typeof BEDS)[number]; maxPrice: number; q: string };

/** Whether a listing passes the filters (shared by the list and by the "what if I removed this filter" hints). */
function matches(p: Property, f: Filters): boolean {
  if (f.type !== "All" && p.type !== f.type) return false;
  if (f.beds === "Studio" && !p.isStudio) return false;
  if (f.beds === "4+" && (p.isStudio || p.bedrooms < 4)) return false;
  if (f.beds !== "Any" && f.beds !== "Studio" && f.beds !== "4+" && (p.isStudio || p.bedrooms !== Number(f.beds))) return false;
  if (f.maxPrice && p.price > f.maxPrice) return false;
  const needle = f.q.trim().toLowerCase();
  if (needle && !`${p.title} ${p.location} ${p.type}`.toLowerCase().includes(needle)) return false;
  return true;
}

const money = (p: Property) => `AED ${p.price.toLocaleString("en-US")}${p.purpose === "rent" ? (p.rentFrequency === "monthly" ? " /mo" : " /yr") : ""}`;

/** Compares up to three listings side by side. */
function CompareModal({ items, onClose, onRemove }: { items: Property[]; onClose: () => void; onRemove: (id: string) => void }) {
  const panel = useDialog<HTMLDivElement>(onClose);
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
      <motion.div ref={panel} tabIndex={-1} initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 30, opacity: 0 }} transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }} onClick={(e) => e.stopPropagation()} className="max-h-[90vh] w-full max-w-4xl outline-none overflow-auto rounded-t-3xl bg-surface p-5 shadow-2xl sm:rounded-3xl sm:p-7">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-heading">Compare properties</h2>
          <button type="button" onClick={onClose} aria-label="Close" className="flex h-11 w-11 items-center justify-center rounded-full text-brand-ink/66 hover:bg-brand-paper"><X size={18} /></button>
        </div>
        {/* A grid, not a table: every property column is exactly 1fr wide whatever its text, so all the photos are the same size. */}
        <div className="mt-4 overflow-x-auto">
          <div role="table" aria-label="Property comparison" style={{ gridTemplateColumns: `7rem repeat(${items.length}, minmax(0, 1fr))`, minWidth: `${7 + items.length * 10}rem` }} className="grid text-left text-sm">
            <div role="row" className="contents">
              <div role="columnheader" className="sticky left-0 z-10 bg-surface" />
              {items.map((p) => (
                <div key={p.id} role="columnheader" className="min-w-0 px-2 pb-3 font-normal">
                  <div className="relative h-32 w-full overflow-hidden rounded-xl bg-brand-paper sm:h-40">
                    <Image src={p.image} alt={p.title} fill sizes="(min-width: 640px) 240px, 160px" unoptimized={isServedImage(p.image)} className="object-cover" />
                    <button type="button" onClick={() => onRemove(p.id)} aria-label={`Remove ${p.title}`} className="absolute right-1 top-1 flex h-11 w-11 items-center justify-center rounded-full text-white"><span className="flex h-6 w-6 items-center justify-center rounded-full bg-black/65 hover:bg-red-600"><X size={12} /></span></button>
                  </div>
                  <Link prefetch={false} href={`/property/${p.id}`} className="mt-2 line-clamp-2 block text-sm font-semibold text-heading hover:text-gold-ink">{p.title}</Link>
                </div>
              ))}
            </div>
            {rows.map((r) => {
              const vals = items.map(r.get);
              const best = r.label === "Price / sqft" ? Math.min(...items.map((p) => p.price / Math.max(1, p.sizeSqft))) : null;
              return (
                <div key={r.label} role="row" className="contents">
                  <div role="rowheader" className="sticky left-0 z-10 border-t border-brand-line bg-surface py-2.5 pr-2 text-xs font-semibold uppercase tracking-wide text-brand-ink/66">{r.label}</div>
                  {vals.map((v, i) => (
                    <div key={i} role="cell" className={`min-w-0 break-words border-t border-brand-line px-2 py-2.5 text-brand-ink/85 ${best !== null && Math.abs(items[i].price / Math.max(1, items[i].sizeSqft) - best) < 0.001 && items.length > 1 ? "font-semibold text-emerald-600" : ""}`}>{v}</div>
                  ))}
                </div>
              );
            })}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

/** Shown when nothing matches: says which single filter, if relaxed, would bring results back. */
function EmptyState({ properties, filters, onClear, onRelax }: { properties: Property[]; filters: Filters; onClear: () => void; onRelax: (key: "type" | "beds" | "maxPrice" | "q") => void }) {
  const hints = useMemo(() => {
    const out: { key: "type" | "beds" | "maxPrice" | "q"; label: string; count: number }[] = [];
    const tries: { key: "type" | "beds" | "maxPrice" | "q"; active: boolean; label: string; next: Filters }[] = [
      { key: "maxPrice", active: filters.maxPrice > 0, label: "Remove the price limit", next: { ...filters, maxPrice: 0 } },
      { key: "beds", active: filters.beds !== "Any", label: "Show any number of bedrooms", next: { ...filters, beds: "Any" } },
      { key: "type", active: filters.type !== "All", label: `Show all property types`, next: { ...filters, type: "All" } },
      { key: "q", active: filters.q.trim() !== "", label: "Clear the search", next: { ...filters, q: "" } },
    ];
    for (const t of tries) {
      if (!t.active) continue;
      const count = properties.filter((p) => matches(p, t.next)).length;
      if (count > 0) out.push({ key: t.key, label: t.label, count });
    }
    return out;
  }, [properties, filters]);
  const wa = `https://wa.me/${company.phoneE164.replace("+", "")}?text=${encodeURIComponent("Hi, I'm looking for a property and could not find a match on your website. Can you help?")}`;

  return (
    <div className="mt-6 rounded-3xl border border-dashed border-brand-line p-8 text-center">
      <p className="text-base font-semibold text-heading">Nothing matches those filters</p>
      <p className="mx-auto mt-1 max-w-md text-sm text-brand-ink/66">Try widening your search{hints.length > 0 ? ":" : ", or tell us what you need and we will look for it."}</p>
      {hints.length > 0 && (
        <div className="mt-4 flex flex-wrap justify-center gap-2.5">
          {hints.map((h) => (
            <button key={h.key} type="button" onClick={() => onRelax(h.key)} className="inline-flex min-h-11 items-center rounded-full border border-brand-line px-4 text-sm font-medium text-heading transition-colors hover:border-brand-gold">
              {h.label} <span className="ml-1.5 text-brand-ink/66">({h.count})</span>
            </button>
          ))}
        </div>
      )}
      <div className="mt-4 flex flex-wrap justify-center gap-2.5">
        <button type="button" onClick={onClear} className="inline-flex min-h-11 items-center rounded-full px-4 text-sm font-semibold text-gold-ink underline">Clear all filters</button>
        <a href={wa} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center gap-2 rounded-full bg-brand-navy px-5 text-sm font-semibold text-white hover:bg-brand-navy-light dark:bg-brand-gold dark:text-brand-navy">
          <MessageCircle size={16} aria-hidden="true" /> Ask us to find it
        </a>
      </div>
    </div>
  );
}

/**
 * The listings with one calm filter bar: search, a labelled "Filters" panel (type, price, sort), bedrooms as a
 * single segmented control, and a compare tray (up to three). The filters live in the URL (so a filtered view can be
 * shared and survives Back), and the compare picks live in sessionStorage. It all runs in the browser on the
 * listings already on the page, so it adds no requests; typing is deferred and the cards are memoised with
 * primitive props, so filtering never makes the page stutter.
 */
export default function ListingsBrowser({ properties, emptyText }: { properties: Property[]; emptyText: string }) {
  // The server HTML always lists every property (good for SEO and first paint); the URL's filters and the
  // saved compare picks are applied right after hydration, so there is no mismatch and no Suspense fallback.
  const [type, setType] = useState("All");
  const [beds, setBeds] = useState<(typeof BEDS)[number]>("Any");
  const [q, setQ] = useState("");
  const [maxPrice, setMaxPrice] = useState(0);
  const [sort, setSort] = useState<Sort>("featured");
  const [picked, setPicked] = useState<string[]>([]);
  const [showCompare, setShowCompare] = useState(false);
  const [more, setMore] = useState(false);
  const [ready, setReady] = useState(false);
  const deferredQ = useDeferredValue(q);
  const storageKey = "meteorite:compare:" + (typeof window === "undefined" ? "" : window.location.pathname);

  const types = useMemo(() => Array.from(new Set(properties.map((p) => p.type))), [properties]);
  const prices = useMemo(() => {
    const top = Math.max(0, ...properties.map((p) => p.price));
    if (top === 0) return [];
    const step = Math.pow(10, Math.max(4, String(Math.round(top)).length - 2));
    return Array.from({ length: 6 }, (_, i) => Math.ceil((top * (i + 1)) / 6 / step) * step).filter((v, i, a) => a.indexOf(v) === i);
  }, [properties]);

  const filters = useMemo<Filters>(() => ({ type, beds, maxPrice, q: deferredQ }), [type, beds, maxPrice, deferredQ]);
  const shown = useMemo(() => {
    let list = properties.filter((p) => matches(p, filters));
    if (sort === "low") list = [...list].sort((a, b) => a.price - b.price);
    if (sort === "high") list = [...list].sort((a, b) => b.price - a.price);
    if (sort === "size") list = [...list].sort((a, b) => b.sizeSqft - a.sizeSqft);
    return list;
  }, [properties, filters, sort]);

  // Once, after hydration: read the filters from the URL and the compare picks from sessionStorage.
  useEffect(() => {
    const sp = new URLSearchParams(window.location.search);
    const t = sp.get("type");
    const bd = sp.get("beds");
    const mx = Number(sp.get("max"));
    const so = sp.get("sort") as Sort | null;
    /* eslint-disable react-hooks/set-state-in-effect -- one-time restore from the URL / sessionStorage after hydration */
    if (t && properties.some((p) => p.type === t)) setType(t);
    if (bd && (BEDS as readonly string[]).includes(bd)) setBeds(bd as (typeof BEDS)[number]);
    if (Number.isFinite(mx) && mx > 0) setMaxPrice(mx);
    if (so && SORT_KEYS.includes(so)) setSort(so);
    setQ((sp.get("q") ?? "").slice(0, 80));
    setMore(sp.has("type") || sp.has("max") || sp.has("sort"));
    try {
      const saved = JSON.parse(window.sessionStorage.getItem(storageKey) ?? "[]");
      if (Array.isArray(saved)) {
        const ids = new Set(properties.map((p) => p.id));
        setPicked(saved.filter((id): id is string => typeof id === "string" && ids.has(id)).slice(0, MAX_COMPARE));
      }
    } catch {
      /* storage unavailable: compare simply starts empty */
    }
    setReady(true);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [properties, storageKey]);

  // Keep the URL in step with the filters (replaceState: no navigation, no server work, no history spam).
  useEffect(() => {
    if (!ready) return;
    const next = new URLSearchParams();
    if (type !== "All") next.set("type", type);
    if (beds !== "Any") next.set("beds", beds);
    if (maxPrice > 0) next.set("max", String(maxPrice));
    if (sort !== "featured") next.set("sort", sort);
    if (deferredQ.trim()) next.set("q", deferredQ.trim());
    const qs = next.toString();
    const url = `${window.location.pathname}${qs ? `?${qs}` : ""}${window.location.hash}`;
    if (url !== `${window.location.pathname}${window.location.search}${window.location.hash}`) window.history.replaceState(window.history.state, "", url);
  }, [ready, type, beds, maxPrice, sort, deferredQ]);

  // Remember the compare picks for this tab, so they survive opening a listing and coming back.
  useEffect(() => {
    if (!ready) return;
    try {
      if (picked.length) window.sessionStorage.setItem(storageKey, JSON.stringify(picked));
      else window.sessionStorage.removeItem(storageKey);
    } catch {
      /* ignore */
    }
  }, [ready, picked, storageKey]);

  const toggleCompare = useCallback((id: string) => setPicked((c) => (c.includes(id) ? c.filter((x) => x !== id) : c.length >= MAX_COMPARE ? c : [...c, id])), []);
  const chosen = picked.map((id) => properties.find((p) => p.id === id)).filter((p): p is Property => Boolean(p));
  const filtered = type !== "All" || beds !== "Any" || maxPrice > 0 || q.trim() !== "";
  const panelCount = (type !== "All" ? 1 : 0) + (maxPrice > 0 ? 1 : 0) + (sort !== "featured" ? 1 : 0);
  const full = picked.length >= MAX_COMPARE;
  const clearAll = useCallback(() => { setType("All"); setBeds("Any"); setMaxPrice(0); setQ(""); setSort("featured"); }, []);
  const relax = useCallback((key: "type" | "beds" | "maxPrice" | "q") => {
    if (key === "type") setType("All");
    if (key === "beds") setBeds("Any");
    if (key === "maxPrice") setMaxPrice(0);
    if (key === "q") setQ("");
  }, []);

  if (properties.length === 0) {
    return <p className="rounded-3xl border border-dashed border-brand-line p-10 text-center text-sm text-brand-ink/66">{emptyText}</p>;
  }

  const field = "min-h-11 w-full rounded-xl border border-brand-line bg-surface px-3 py-2.5 text-sm font-medium text-heading outline-none transition-colors focus:border-brand-gold";
  const labelCls = "mb-1 block text-xs font-semibold uppercase tracking-wide text-brand-ink/66";

  return (
    <>
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="flex flex-1 items-center gap-2">
          <label className="relative block flex-1">
            <Search size={16} aria-hidden="true" className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-ink/45" />
            <span className="sr-only">Search listings</span>
            <input value={q} onChange={(e) => setQ(e.target.value)} type="search" placeholder="Search by area or building" className={`${field} pl-10 font-normal`} />
          </label>
          <HelpMeChoose properties={properties} prices={prices} onApply={(m, b) => { setMaxPrice(m); setBeds(b as (typeof BEDS)[number]); }} />
        </div>
        <div className="flex items-center gap-2">
          <div role="group" aria-label="Bedrooms" className="flex flex-1 overflow-hidden rounded-xl border border-brand-line bg-surface sm:flex-none">
            {BEDS.map((b) => (
              <button key={b} type="button" aria-pressed={b === beds} onClick={() => setBeds(b)} className={`min-h-11 flex-1 px-3 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand-gold sm:flex-none ${b === beds ? "bg-brand-gold text-brand-navy" : "text-brand-ink/72 hover:bg-brand-paper hover:text-heading"}`}>
                {b === "Any" ? "All" : b}
              </button>
            ))}
          </div>
          <button type="button" onClick={() => setMore((v) => !v)} aria-expanded={more} aria-controls="more-filters" className={`inline-flex min-h-11 flex-none items-center gap-2 rounded-xl border px-3.5 text-sm font-semibold transition-colors ${more || panelCount > 0 ? "border-brand-gold bg-brand-gold/15 text-gold-ink" : "border-brand-line bg-surface text-brand-ink/80 hover:border-brand-gold"}`}>
            <SlidersHorizontal size={16} aria-hidden="true" /> Filters
            {panelCount > 0 && <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-gold px-1 text-[11px] font-bold text-brand-navy">{panelCount}</span>}
          </button>
        </div>
      </div>
      {more && (
        <div id="more-filters" className="mt-3 grid gap-3 sm:grid-cols-3">
          {types.length > 1 && (
            <label>
              <span className={labelCls}>Property type</span>
              <select value={type} onChange={(e) => setType(e.target.value)} className={field}>
                <option value="All">All types</option>
                {types.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </label>
          )}
          {prices.length > 0 && (
            <label>
              <span className={labelCls}>Maximum price</span>
              <select value={maxPrice} onChange={(e) => setMaxPrice(Number(e.target.value))} className={field}>
                <option value={0}>Any price</option>
                {maxPrice > 0 && !prices.includes(maxPrice) && <option value={maxPrice}>Up to AED {maxPrice.toLocaleString("en-US")}</option>}
                {prices.map((v) => <option key={v} value={v}>Up to AED {v.toLocaleString("en-US")}</option>)}
              </select>
            </label>
          )}
          <label>
            <span className={labelCls}>Sort by</span>
            <select value={sort} onChange={(e) => setSort(e.target.value as Sort)} className={field}>
              {SORTS.map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}
            </select>
          </label>
        </div>
      )}
      <div className="mt-3 flex min-h-11 items-center justify-between text-xs text-brand-ink/66" aria-live="polite">
        <span>{shown.length} of {properties.length} listing{properties.length === 1 ? "" : "s"}</span>
        {(filtered || sort !== "featured") && <button type="button" onClick={clearAll} className="inline-flex min-h-11 items-center px-2 text-sm font-semibold text-gold-ink underline">Clear filters</button>}
      </div>

      <div className="mt-1 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {shown.map((p, i) => (
          <PropertyCard key={p.id} property={p} delay={Math.min(i, 7) * 0.05} priority={i < 2} comparable selected={picked.includes(p.id)} compareDisabled={full} onCompare={toggleCompare} />
        ))}
      </div>
      {shown.length === 0 && <EmptyState properties={properties} filters={{ type, beds, maxPrice, q }} onClear={clearAll} onRelax={relax} />}

      <AnimatePresence>
        {picked.length > 0 && (
          <motion.div initial={{ y: 80, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 80, opacity: 0 }} transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }} className="fixed inset-x-0 bottom-4 z-40 mx-auto flex w-fit max-w-[92vw] items-center gap-2 rounded-full bg-brand-navy py-1.5 pl-4 pr-1.5 text-white shadow-[0_20px_50px_-15px_rgba(0,0,0,0.7)] ring-1 ring-brand-gold/40">
            <Scale size={16} aria-hidden="true" className="text-brand-gold" />
            <span className="text-sm font-medium">{picked.length} selected</span>
            <button type="button" disabled={picked.length < 2} onClick={() => setShowCompare(true)} className="min-h-11 rounded-full bg-brand-gold px-5 text-sm font-semibold text-brand-navy disabled:opacity-50">{picked.length < 2 ? "Pick one more" : "Compare"}</button>
            <button type="button" onClick={() => setPicked([])} aria-label="Clear selection" className="flex h-11 w-11 items-center justify-center rounded-full text-white/80 hover:bg-white/10"><X size={16} /></button>
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {showCompare && chosen.length >= 2 && <CompareModal items={chosen} onClose={() => setShowCompare(false)} onRemove={(id) => { setPicked((c) => c.filter((x) => x !== id)); if (picked.length <= 2) setShowCompare(false); }} />}
      </AnimatePresence>
    </>
  );
}
