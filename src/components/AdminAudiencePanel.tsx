import Link from "next/link";
import { Monitor, Smartphone, Tablet } from "lucide-react";

type Slice = { name: string; value: number };

const ICON: Record<string, typeof Monitor> = { Mobile: Smartphone, Desktop: Monitor, Tablet: Tablet };

/**
 * Who is visiting and when: device split, the busiest hours (Dubai time) and the most-visited pages and
 * listings. Pure markup on numbers the overview already read, so it costs nothing extra.
 */
export default function AdminAudiencePanel({ devices, hours, topPages, topProperties }: { devices: Slice[]; hours: number[]; topPages: Slice[]; topProperties: { id: string; title: string; value: number }[] }) {
  const dTotal = devices.reduce((a, d) => a + d.value, 0);
  const hMax = Math.max(1, ...hours);
  const hasHours = hours.some((h) => h > 0);
  const peak = hasHours ? hours.indexOf(hMax) : -1;
  const pMax = Math.max(1, ...topPages.map((p) => p.value));
  const tone = ["bg-brand-gold", "bg-brand-navy dark:bg-white/70", "bg-brand-gold-soft"];

  const empty = <p className="mt-4 text-sm text-brand-ink/60">Collecting data — this fills in as visitors arrive.</p>;

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="glass shimmer-border rounded-3xl p-5 sm:p-6">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-brand-ink/66">Devices</h3>
        {dTotal === 0 ? empty : (
          <>
            <div className="mt-4 flex h-3 overflow-hidden rounded-full bg-brand-ink/10">
              {devices.map((d, i) => <span key={d.name} className={`${tone[i % tone.length]} h-full`} style={{ width: `${(d.value / dTotal) * 100}%` }} />)}
            </div>
            <ul className="mt-4 space-y-2.5">
              {devices.map((d, i) => {
                const Icon = ICON[d.name] ?? Monitor;
                return (
                  <li key={d.name} className="flex items-center gap-2.5 text-sm">
                    <span className={`h-2.5 w-2.5 rounded-full ${tone[i % tone.length]}`} />
                    <Icon size={15} className="text-brand-ink/55" />
                    <span className="flex-1 font-medium text-heading">{d.name}</span>
                    <span className="tabular-nums text-brand-ink/70">{Math.round((d.value / dTotal) * 100)}%</span>
                  </li>
                );
              })}
            </ul>
          </>
        )}
      </div>

      <div className="glass shimmer-border rounded-3xl p-5 sm:p-6">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-brand-ink/66">Busiest hours <span className="font-normal normal-case text-brand-ink/50">(Dubai time)</span></h3>
        {!hasHours ? empty : (
          <>
            <div className="mt-4 flex h-24 items-end gap-[3px]" role="img" aria-label="Visits by hour of day">
              {hours.map((h, i) => (
                <span key={i} title={`${String(i).padStart(2, "0")}:00 — ${h}`} className={`flex-1 rounded-t ${i === peak ? "bg-brand-gold" : "bg-brand-gold/35"}`} style={{ height: `${Math.max(4, (h / hMax) * 100)}%` }} />
              ))}
            </div>
            <div className="mt-1.5 flex justify-between text-[10px] tabular-nums text-brand-ink/55"><span>00</span><span>06</span><span>12</span><span>18</span><span>23</span></div>
            <p className="mt-3 text-sm text-brand-ink/70">Peak around <span className="font-semibold text-heading">{String(peak).padStart(2, "0")}:00</span>.</p>
          </>
        )}
      </div>

      <div className="glass shimmer-border rounded-3xl p-5 sm:p-6">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-brand-ink/66">Top pages</h3>
        {topPages.length === 0 ? empty : (
          <ul className="mt-4 space-y-2.5">
            {topPages.map((p) => (
              <li key={p.name}>
                <div className="flex items-baseline justify-between text-sm"><span className="font-medium text-heading">{p.name}</span><span className="tabular-nums text-brand-ink/66">{p.value.toLocaleString("en-US")}</span></div>
                <div className="mt-1 h-1 overflow-hidden rounded-full bg-brand-ink/10"><div className="h-full rounded-full bg-gradient-to-r from-brand-gold to-brand-gold-soft" style={{ width: `${(p.value / pMax) * 100}%` }} /></div>
              </li>
            ))}
          </ul>
        )}
        {topProperties.length > 0 && (
          <>
            <h4 className="mt-5 text-xs font-semibold uppercase tracking-wide text-brand-ink/60">Most viewed listings</h4>
            <ul className="mt-2 space-y-1.5">
              {topProperties.map((p) => (
                <li key={p.id} className="flex items-baseline justify-between gap-3 text-sm">
                  <Link prefetch={false} href={`/property/${p.id}`} className="line-clamp-1 font-medium text-heading hover:text-gold-ink">{p.title}</Link>
                  <span className="flex-none tabular-nums text-brand-ink/66">{p.value}</span>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </div>
  );
}
