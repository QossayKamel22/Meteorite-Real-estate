"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Sparkles, X } from "lucide-react";
import type { Property } from "@/lib/properties-data";
import { isServedImage } from "@/lib/image-url";

const BEDS = ["Studio", "1", "2", "3", "4+"] as const;
const money = (p: Property) => `AED ${p.price.toLocaleString("en-US")}${p.purpose === "rent" ? (p.rentFrequency === "monthly" ? " /mo" : " /yr") : ""}`;
const bedsOf = (p: Property) => (p.isStudio ? 0 : p.bedrooms);

/** How far a listing is from what the visitor asked for (0 = a perfect match). */
function distance(p: Property, budget: number, beds: string): number {
  let d = 0;
  if (budget && p.price > budget) d += 2 + (p.price - budget) / budget;
  if (beds) {
    const want = beds === "Studio" ? 0 : beds === "4+" ? 4 : Number(beds);
    const have = bedsOf(p);
    d += beds === "4+" ? (have >= 4 ? 0 : 4 - have) : Math.abs(want - have);
  }
  return d;
}

/**
 * "Help me choose": two quick questions (budget, bedrooms), then the three best matches from the listings
 * on the page, each linking to its own page. Runs entirely in the browser on data already loaded.
 */
export default function HelpMeChoose({ properties, prices, onApply }: { properties: Property[]; prices: number[]; onApply: (maxPrice: number, beds: string) => void }) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [budget, setBudget] = useState<number | null>(null);
  const [beds, setBeds] = useState<string | null>(null);

  const results = useMemo(() => {
    if (budget === null || beds === null) return [];
    return [...properties].map((p) => ({ p, d: distance(p, budget, beds === "Any" ? "" : beds) })).sort((a, b) => a.d - b.d || a.p.price - b.p.price).slice(0, 3);
  }, [properties, budget, beds]);
  const exact = results.filter((r) => r.d === 0).length;

  function close() {
    setOpen(false);
    window.setTimeout(() => {
      setStep(0);
      setBudget(null);
      setBeds(null);
    }, 250);
  }
  const chip = (on: boolean) => `rounded-full border px-4 py-2 text-sm font-medium transition-colors ${on ? "border-brand-gold bg-brand-gold text-brand-navy" : "border-brand-line text-brand-ink/80 hover:border-brand-gold/60"}`;

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className="inline-flex items-center gap-2 rounded-xl border border-brand-gold/50 bg-brand-gold/10 px-4 py-2.5 text-sm font-semibold text-gold-ink transition-colors hover:bg-brand-gold hover:text-brand-navy">
        <Sparkles size={15} /> Help me choose
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-end justify-center bg-[#05061a]/80 backdrop-blur-sm sm:items-center sm:p-6" onClick={close} role="dialog" aria-modal="true" aria-label="Help me choose">
            <motion.div initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 30, opacity: 0 }} transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }} onClick={(e) => e.stopPropagation()} className="max-h-[90vh] w-full max-w-lg overflow-auto rounded-t-3xl bg-surface p-6 shadow-2xl sm:rounded-3xl">
              <div className="flex items-center justify-between">
                <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-gold-ink"><Sparkles size={14} /> Step {Math.min(step + 1, 3)} of 3</p>
                <button type="button" onClick={close} aria-label="Close" className="flex h-9 w-9 items-center justify-center rounded-full text-brand-ink/66 hover:bg-brand-paper"><X size={18} /></button>
              </div>
              <div className="mt-2 h-1 overflow-hidden rounded-full bg-brand-ink/10"><div className="h-full rounded-full bg-brand-gold transition-all duration-500" style={{ width: `${((step + 1) / 3) * 100}%` }} /></div>

              {step === 0 && (
                <div className="mt-6">
                  <h2 className="text-xl font-semibold text-heading">What is your budget?</h2>
                  <div className="mt-4 flex flex-wrap gap-2.5">
                    {prices.map((v) => <button key={v} type="button" onClick={() => { setBudget(v); setStep(1); }} className={chip(budget === v)}>Up to AED {v.toLocaleString("en-US")}</button>)}
                    <button type="button" onClick={() => { setBudget(0); setStep(1); }} className={chip(budget === 0)}>No limit</button>
                  </div>
                </div>
              )}
              {step === 1 && (
                <div className="mt-6">
                  <h2 className="text-xl font-semibold text-heading">How many bedrooms?</h2>
                  <div className="mt-4 flex flex-wrap gap-2.5">
                    {BEDS.map((b) => <button key={b} type="button" onClick={() => { setBeds(b); setStep(2); }} className={chip(beds === b)}>{b === "Studio" ? "Studio" : `${b} bed`}</button>)}
                    <button type="button" onClick={() => { setBeds("Any"); setStep(2); }} className={chip(beds === "Any")}>Not sure</button>
                  </div>
                  <button type="button" onClick={() => setStep(0)} className="mt-5 text-sm font-medium text-brand-ink/66 underline">Back</button>
                </div>
              )}
              {step === 2 && (
                <div className="mt-6">
                  <h2 className="text-xl font-semibold text-heading">{exact > 0 ? `${exact} match${exact === 1 ? "" : "es"} for you` : "Closest to what you asked for"}</h2>
                  {exact === 0 && <p className="mt-1 text-sm text-brand-ink/66">Nothing fits exactly right now, so these are the nearest options.</p>}
                  <ul className="mt-4 space-y-3">
                    {results.map(({ p }) => (
                      <li key={p.id}>
                        <Link prefetch={false} href={`/property/${p.id}`} className="group flex items-center gap-3 rounded-2xl border border-brand-line p-2.5 transition-colors hover:border-brand-gold">
                          <span className="relative h-16 w-20 flex-none overflow-hidden rounded-xl bg-brand-paper"><Image src={p.image} alt="" fill sizes="80px" unoptimized={isServedImage(p.image)} className="object-cover" /></span>
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-sm font-semibold text-heading">{p.title}</span>
                            <span className="block text-sm font-semibold text-gold-ink">{money(p)}</span>
                            <span className="block truncate text-xs text-brand-ink/66">{p.isStudio ? "Studio" : `${p.bedrooms} bed`} · {p.sizeSqft.toLocaleString("en-US")} sqft · {p.location}</span>
                          </span>
                          <ArrowRight size={16} className="flex-none text-brand-ink/40 transition-transform group-hover:translate-x-1 group-hover:text-gold-ink" />
                        </Link>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-5 flex flex-wrap items-center gap-3">
                    <button type="button" onClick={() => { onApply(budget ?? 0, beds === "Any" || beds === null ? "Any" : beds); close(); }} className="rounded-full bg-brand-navy px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-navy-light dark:bg-brand-gold dark:text-brand-navy">Show these in the list</button>
                    <button type="button" onClick={() => setStep(0)} className="text-sm font-medium text-brand-ink/66 underline">Start again</button>
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
