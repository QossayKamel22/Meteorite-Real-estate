"use client";

import { useId, useMemo, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowDownRight, ArrowUpRight, Download } from "lucide-react";

type Point = { date: string; iso: string; count: number };
type Slice = { name: string; value: number };

const RANGES = [7, 14, 30] as const;
const W = 640;
const H = 190;
const PAD = { l: 8, r: 8, t: 14, b: 22 };

/** A smooth line through the points (Catmull-Rom turned into cubic Béziers). */
function smooth(pts: { x: number; y: number }[]): string {
  if (pts.length < 2) return "";
  let d = `M${pts[0].x},${pts[0].y}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] ?? pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] ?? p2;
    const c1 = { x: p1.x + (p2.x - p0.x) / 6, y: p1.y + (p2.y - p0.y) / 6 };
    const c2 = { x: p2.x - (p3.x - p1.x) / 6, y: p2.y - (p3.y - p1.y) / 6 };
    d += ` C${c1.x},${c1.y} ${c2.x},${c2.y} ${p2.x},${p2.y}`;
  }
  return d;
}

/**
 * The traffic card: a 7 / 14 / 30 day switch over one light SVG chart (hover for the exact day),
 * four figures that follow the range (total, daily average, best day, change against the period
 * before it), a CSV download, and the visits-by-section bars. Drawn by hand, so it costs the admin
 * no chart library.
 */
export default function AdminTrafficPanel({ days, sections }: { days: Point[]; sections: Slice[] }) {
  const reduce = useReducedMotion() ?? false;
  const gid = useId().replace(/:/g, "");
  const [range, setRange] = useState<(typeof RANGES)[number]>(14);
  const [hover, setHover] = useState<number | null>(null);

  const cur = useMemo(() => days.slice(-range), [days, range]);
  const prev = useMemo(() => (days.length >= range * 2 ? days.slice(-range * 2, -range) : null), [days, range]);
  const total = cur.reduce((a, d) => a + d.count, 0);
  const prevTotal = prev ? prev.reduce((a, d) => a + d.count, 0) : null;
  const best = cur.reduce((a, d) => (d.count > a.count ? d : a), cur[0] ?? { date: "-", iso: "", count: 0 });
  const delta = prevTotal === null ? null : prevTotal === 0 ? (total > 0 ? 100 : 0) : Math.round(((total - prevTotal) / prevTotal) * 100);

  const max = Math.max(4, ...cur.map((d) => d.count));
  const iw = W - PAD.l - PAD.r;
  const ih = H - PAD.t - PAD.b;
  const pts = cur.map((d, i) => ({ x: PAD.l + (cur.length === 1 ? iw / 2 : (i / (cur.length - 1)) * iw), y: PAD.t + ih - (d.count / max) * ih }));
  const line = smooth(pts);
  const area = pts.length > 1 ? `${line} L${pts[pts.length - 1].x},${PAD.t + ih} L${pts[0].x},${PAD.t + ih} Z` : "";
  const sectionTotal = sections.reduce((a, s) => a + s.value, 0) || 1;
  const hv = hover !== null ? cur[hover] : null;

  function csv() {
    const rows = ["date,page_views", ...days.map((d) => `${d.iso},${d.count}`)].join("\n");
    const url = URL.createObjectURL(new Blob([rows], { type: "text/csv" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = "meteorite-visits.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="glass shimmer-border rounded-3xl p-5 sm:p-6 lg:col-span-2">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-brand-ink/66">Site visits</h3>
          <div className="flex items-center gap-2">
            <div role="group" aria-label="Range" className="flex rounded-full bg-brand-ink/[0.06] p-0.5">
              {RANGES.map((r) => (
                <button key={r} type="button" onClick={() => setRange(r)} aria-pressed={range === r} className={`relative rounded-full px-3 py-1 text-xs font-semibold transition-colors ${range === r ? "text-brand-navy" : "text-brand-ink/66 hover:text-heading"}`}>
                  {range === r && <motion.span layoutId={`range-${gid}`} transition={{ type: "spring", stiffness: 400, damping: 32 }} className="absolute inset-0 rounded-full bg-brand-gold" />}
                  <span className="relative">{r}d</span>
                </button>
              ))}
            </div>
            <button type="button" onClick={csv} aria-label="Download visits as CSV" title="Download CSV" className="flex h-8 w-8 items-center justify-center rounded-full border border-brand-line text-brand-ink/66 transition-colors hover:border-brand-gold hover:text-heading">
              <Download size={14} />
            </button>
          </div>
        </div>

        <dl className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { k: "Visits", v: total.toLocaleString("en-US") },
            { k: "Per day", v: (Math.round((total / Math.max(1, cur.length)) * 10) / 10).toString() },
            { k: "Best day", v: best.count > 0 ? `${best.count} · ${best.date}` : "–" },
          ].map((x) => (
            <div key={x.k} className="rounded-2xl bg-brand-ink/[0.04] px-3.5 py-2.5">
              <dt className="text-[11px] font-semibold uppercase tracking-[0.14em] text-brand-ink/60">{x.k}</dt>
              <dd className="mt-0.5 text-lg font-semibold tabular-nums text-heading">{x.v}</dd>
            </div>
          ))}
          <div className="rounded-2xl bg-brand-ink/[0.04] px-3.5 py-2.5">
            <dt className="text-[11px] font-semibold uppercase tracking-[0.14em] text-brand-ink/60">vs. previous {range}d</dt>
            <dd className={`mt-0.5 flex items-center gap-1 text-lg font-semibold tabular-nums ${delta === null ? "text-brand-ink/50" : delta >= 0 ? "text-emerald-500" : "text-red-500"}`}>
              {delta === null ? "–" : (<>{delta >= 0 ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}{Math.abs(delta)}%</>)}
            </dd>
          </div>
        </dl>

        <div className="relative mt-4">
          <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label={`Page views over the last ${range} days`} onMouseLeave={() => setHover(null)}>
            <defs>
              <linearGradient id={`g-${gid}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#dbcc3b" stopOpacity="0.38" />
                <stop offset="100%" stopColor="#dbcc3b" stopOpacity="0" />
              </linearGradient>
            </defs>
            {[0, 0.5, 1].map((t) => (
              <line key={t} x1={PAD.l} x2={W - PAD.r} y1={PAD.t + ih * t} y2={PAD.t + ih * t} stroke="currentColor" className="text-brand-ink/10" strokeDasharray={t === 1 ? undefined : "3 5"} />
            ))}
            {area && <path d={area} fill={`url(#g-${gid})`} />}
            <motion.path key={range} d={line} fill="none" stroke="#b8a900" strokeWidth="2.2" strokeLinecap="round" initial={{ pathLength: reduce ? 1 : 0 }} animate={{ pathLength: 1 }} transition={{ duration: reduce ? 0 : 0.9, ease: [0.22, 1, 0.36, 1] }} />
            {cur.map((d, i) => (
              <rect key={d.iso} x={pts[i].x - iw / cur.length / 2} y={0} width={iw / cur.length} height={H} fill="transparent" onMouseEnter={() => setHover(i)} />
            ))}
            {hv && hover !== null && (
              <g>
                <line x1={pts[hover].x} x2={pts[hover].x} y1={PAD.t} y2={PAD.t + ih} stroke="#b8a900" strokeDasharray="3 4" />
                <circle cx={pts[hover].x} cy={pts[hover].y} r="4.5" fill="#dbcc3b" stroke="#0d1031" strokeWidth="1.5" />
              </g>
            )}
            {[0, Math.floor((cur.length - 1) / 2), cur.length - 1].map((i) => cur[i] && (
              <text key={i} x={pts[i].x} y={H - 5} textAnchor={i === 0 ? "start" : i === cur.length - 1 ? "end" : "middle"} className="fill-current text-brand-ink/55" fontSize="11">{cur[i].date}</text>
            ))}
          </svg>
          {hv && hover !== null && (
            <div className="pointer-events-none absolute top-0 -translate-x-1/2 rounded-lg bg-brand-navy px-2.5 py-1 text-xs font-semibold text-white shadow-lg" style={{ left: `${(pts[hover].x / W) * 100}%` }}>
              {hv.date}: {hv.count}
            </div>
          )}
        </div>
      </div>

      <div className="glass shimmer-border rounded-3xl p-5 sm:p-6">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-brand-ink/66">Visits by section</h3>
        {sections.length === 0 ? (
          <p className="mt-4 text-sm text-brand-ink/60">No visits recorded yet.</p>
        ) : (
          <ul className="mt-4 space-y-3">
            {[...sections].sort((a, b) => b.value - a.value).map((s, i) => {
              const pct = Math.round((s.value / sectionTotal) * 100);
              return (
                <li key={s.name}>
                  <div className="flex items-baseline justify-between text-sm">
                    <span className="font-medium text-heading">{s.name}</span>
                    <span className="tabular-nums text-brand-ink/66">{s.value.toLocaleString("en-US")} · {pct}%</span>
                  </div>
                  <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-brand-ink/10">
                    <motion.div initial={{ scaleX: 0 }} whileInView={{ scaleX: 1 }} viewport={{ once: true }} transition={{ duration: reduce ? 0 : 0.9, delay: i * 0.06, ease: [0.22, 1, 0.36, 1] }} style={{ transformOrigin: "left", width: `${pct}%` }} className="h-full rounded-full bg-gradient-to-r from-brand-gold to-brand-gold-soft" />
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
