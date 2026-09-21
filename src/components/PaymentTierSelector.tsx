"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ClipboardList } from "lucide-react";
import Reveal from "@/components/Reveal";

type Tier = { amount: number; url: string };

const PURPOSES = [
  "Booking deposit",
  "Rental payment",
  "Down payment",
  "Service fee",
  "Other",
] as const;

/**
 * Stripe Payment Links accept a client_reference_id query param that shows
 * up against the payment in Stripe's own dashboard — this is how we attach
 * "what this payment is for" without needing our own backend or inventing
 * fixed meanings for the three fixed amounts (which the live site never
 * labelled either).
 */
function buildPayUrl(baseUrl: string, purpose: string, note: string): string {
  const reference = note.trim() ? `${purpose}: ${note.trim()}` : purpose;
  const url = new URL(baseUrl);
  url.searchParams.set("client_reference_id", reference.slice(0, 200));
  return url.toString();
}

export default function PaymentTierSelector({ tiers }: { tiers: Tier[] }) {
  const [purpose, setPurpose] = useState<string>(PURPOSES[0]);
  const [note, setNote] = useState("");

  return (
    <>
      <Reveal delay={0.12}>
        <div className="glass glass-dark mx-auto mt-10 max-w-xl rounded-2xl p-5 text-left">
          <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.15em] text-white/60">
            <ClipboardList size={14} /> What&apos;s this payment for?
          </p>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <select
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-sm text-white outline-none focus:border-brand-gold [&>option]:bg-brand-navy"
            >
              {PURPOSES.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
            <input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Property reference (optional)"
              maxLength={120}
              className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-white/35 outline-none focus:border-brand-gold"
            />
          </div>
          <p className="mt-2.5 text-[11px] leading-relaxed text-white/40">
            This note travels with your payment so our team knows what it&apos;s for — it&apos;s
            never required, just helpful.
          </p>
        </div>
      </Reveal>

      <div className="mt-8 grid gap-5 sm:grid-cols-3">
        {tiers.map((tier, i) => (
          <Reveal key={tier.amount} delay={0.2 + i * 0.08}>
            <motion.a
              href={buildPayUrl(tier.url, purpose, note)}
              target="_blank"
              rel="noopener noreferrer"
              className="glass glass-dark shimmer-border group flex flex-col items-center rounded-2xl p-7"
              whileHover={{ y: -6 }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <p className="text-xs font-semibold uppercase tracking-[0.15em] text-white/50">AED</p>
              <p className="mt-2 text-3xl font-semibold tracking-tight text-white">
                {tier.amount.toLocaleString()}
              </p>
              <AnimatePresence mode="wait">
                <motion.span
                  key={purpose}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.2 }}
                  className="mt-1.5 text-[11px] text-white/40"
                >
                  {purpose}
                </motion.span>
              </AnimatePresence>
              <span className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-brand-gold px-4 py-2 text-xs font-semibold text-brand-navy transition-transform group-hover:scale-105">
                Pay now <span aria-hidden="true">→</span>
              </span>
            </motion.a>
          </Reveal>
        ))}
      </div>
    </>
  );
}
