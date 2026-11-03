"use client";

import { useRef, useState } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { BadgeCheck, Check, Copy, MapPin } from "lucide-react";

const EASE = [0.22, 1, 0.36, 1] as const;

type Field = { label: string; value: string; copy?: boolean; wide?: boolean };

/** One line of the register: the label, and the value that is "stamped" in under a scanning line. */
function Row({ f, index, show, still }: { f: Field; index: number; show: boolean; still: boolean }) {
  const [copied, setCopied] = useState(false);
  async function copy() {
    try {
      await navigator.clipboard.writeText(f.value.replace(/^#/, ""));
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard blocked: the value is still on screen */
    }
  }
  return (
    <motion.div
      initial={{ opacity: 0, y: still ? 0 : 22 }}
      animate={show ? { opacity: 1, y: 0 } : undefined}
      transition={{ duration: 0.8, delay: 0.45 + index * 0.14, ease: EASE }}
      className={`group relative rounded-2xl border border-transparent px-4 py-3 transition-colors duration-300 hover:border-brand-gold/30 hover:bg-brand-gold/[0.06] ${f.wide ? "sm:col-span-2" : ""}`}
    >
      <dt className="text-[11px] font-semibold uppercase tracking-[0.18em] text-brand-ink/45">{f.label}</dt>
      <dd className="mt-1 flex items-center gap-2 overflow-hidden text-[15px] font-medium text-brand-ink/85">
        <motion.span
          initial={{ clipPath: still ? "inset(0 0 0 0)" : "inset(0 100% 0 0)" }}
          animate={show ? { clipPath: "inset(0 0% 0 0)" } : undefined}
          transition={{ duration: still ? 0 : 1, delay: 0.7 + index * 0.14, ease: EASE }}
        >
          {f.value}
        </motion.span>
        {f.copy && (
          <button type="button" onClick={copy} aria-label={`Copy ${f.label}`} className="flex h-6 w-6 flex-none items-center justify-center rounded-full text-brand-ink/35 opacity-0 transition-all hover:text-brand-gold focus-visible:opacity-100 group-hover:opacity-100">
            {copied ? <Check size={13} className="text-emerald-500" /> : <Copy size={13} />}
          </button>
        )}
      </dd>
    </motion.div>
  );
}

/**
 * The company's registration, presented as an official register entry: a verified seal that
 * turns slowly on the left, the details on the right stamped in one after another, and a gold
 * line that scans down the card once as it opens. ORN and broker card copy with a click.
 */
export default function RegistrationDetails({ address, poBox, orn, brokerCard }: { address: string; poBox: string; orn: string; brokerCard: string }) {
  const reduce = useReducedMotion() ?? false;
  const ref = useRef<HTMLDivElement>(null);
  const show = useInView(ref, { once: true, amount: 0.35 });
  const fields: Field[] = [
    { label: "Office Address", value: address, wide: true },
    { label: "P.O. Box", value: poBox },
    { label: "RERA ORN", value: orn, copy: true },
    { label: "Broker Card", value: `#${brokerCard}`, copy: true },
  ];

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: reduce ? 0 : 44 }}
      animate={show ? { opacity: 1, y: 0 } : undefined}
      transition={{ duration: 0.9, ease: EASE }}
      className="glass shimmer-border relative overflow-hidden rounded-3xl p-7 sm:p-10"
    >
      {/* guilloché rings, like the pattern on a licence */}
      <svg aria-hidden="true" viewBox="0 0 400 400" className="pointer-events-none absolute -right-20 -top-24 h-[26rem] w-[26rem] text-brand-gold opacity-[0.1]">
        {[40, 70, 100, 130, 160, 190].map((r, i) => (
          <circle key={r} cx="200" cy="200" r={r} fill="none" stroke="currentColor" strokeWidth="0.8" strokeDasharray={i % 2 ? "2 6" : "none"} />
        ))}
      </svg>
      {/* the scan line */}
      {!reduce && (
        <motion.span
          aria-hidden="true"
          initial={{ top: "-4%", opacity: 0 }}
          animate={show ? { top: ["-4%", "104%"], opacity: [0, 1, 1, 0] } : undefined}
          transition={{ duration: 1.8, delay: 0.3, ease: "easeInOut" }}
          className="pointer-events-none absolute inset-x-0 h-px bg-gradient-to-r from-transparent via-brand-gold to-transparent shadow-[0_0_18px_3px_rgba(219,204,59,0.5)]"
        />
      )}

      <div className="relative grid items-center gap-8 sm:grid-cols-[auto_1fr]">
        <div className="flex flex-col items-center gap-3">
          <div className="relative flex h-32 w-32 items-center justify-center sm:h-36 sm:w-36">
            <svg viewBox="0 0 120 120" aria-hidden="true" className={`absolute inset-0 text-brand-gold ${reduce ? "" : "seal-spin"}`}>
              <defs>
                <path id="seal-circle" d="M60,60 m-50,0 a50,50 0 1,1 100,0 a50,50 0 1,1 -100,0" />
              </defs>
              <circle cx="60" cy="60" r="57" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="2 4" />
              <text fill="currentColor" fontSize="8.4" fontWeight="600" letterSpacing="3.4">
                <textPath href="#seal-circle">RERA · DUBAI LAND DEPARTMENT · LICENSED BROKERAGE ·</textPath>
              </text>
            </svg>
            <motion.span
              initial={{ scale: reduce ? 1 : 0, rotate: reduce ? 0 : -90 }}
              animate={show ? { scale: 1, rotate: 0 } : undefined}
              transition={{ type: "spring", stiffness: 160, damping: 13, delay: 0.35 }}
              className="relative flex h-16 w-16 items-center justify-center rounded-full bg-brand-gold text-brand-navy shadow-[0_0_34px_4px_rgba(219,204,59,0.4)]"
            >
              <BadgeCheck size={30} strokeWidth={1.8} />
            </motion.span>
          </div>
          <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-brand-gold">
            <MapPin size={12} /> Registered in Dubai
          </p>
        </div>

        <div>
          <h2 className="text-lg font-semibold text-heading">Registration Details</h2>
          <dl className="mt-3 grid gap-x-2 gap-y-1 sm:grid-cols-2">
            {fields.map((f, i) => (
              <Row key={f.label} f={f} index={i} show={show} still={reduce} />
            ))}
          </dl>
        </div>
      </div>
    </motion.div>
  );
}
