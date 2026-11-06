"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Bell, CheckCircle2, ChevronDown, ChevronUp, Plus, Trash2 } from "lucide-react";
import { ALL_TIMES, DEFAULT_FAQ, FAQ_LIMITS, type FaqSet, type ViewingSettings } from "@/lib/site-settings-shared";

const TABS = [
  { key: "sale", label: "Buying (For Sale)" },
  { key: "rent", label: "Renting (For Rent)" },
  { key: "contact", label: "Contact" },
] as const;
const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const input = "mt-1 w-full rounded-lg border border-brand-line bg-background px-3 py-2 text-sm outline-none focus:border-brand-gold";

function useSave() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  async function save(body: object) {
    setBusy(true);
    setMsg(null);
    try {
      const res = await fetch("/api/admin/site-settings", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) setMsg({ ok: false, text: data.error ?? "Couldn't save." });
      else {
        setMsg({ ok: true, text: "Saved" });
        router.refresh();
        window.setTimeout(() => setMsg(null), 2500);
      }
    } catch {
      setMsg({ ok: false, text: "Something went wrong. Please try again." });
    } finally {
      setBusy(false);
    }
  }
  return { busy, msg, save };
}

function Note({ msg }: { msg: { ok: boolean; text: string } | null }) {
  if (!msg) return null;
  return msg.ok ? <span className="flex items-center gap-1.5 text-sm font-medium text-emerald-600"><CheckCircle2 size={15} /> {msg.text}</span> : <span className="text-sm font-medium text-red-600">{msg.text}</span>;
}

function FaqEditor({ initial }: { initial: FaqSet }) {
  const [faq, setFaq] = useState(initial);
  const [tab, setTab] = useState<(typeof TABS)[number]["key"]>("sale");
  const { busy, msg, save } = useSave();
  const list = faq[tab];
  const set = (next: FaqSet[typeof tab]) => setFaq((f) => ({ ...f, [tab]: next }));
  const move = (i: number, d: -1 | 1) => {
    const n = [...list];
    [n[i], n[i + d]] = [n[i + d], n[i]];
    set(n);
  };

  return (
    <div className="glass shimmer-border rounded-3xl p-5 sm:p-6">
      <h2 className="text-base font-semibold text-heading">Questions &amp; answers</h2>
      <p className="mt-0.5 text-xs text-brand-ink/66">Shown at the bottom of each page. Keep answers general and factual; anything about one property is answered by the team.</p>
      <div role="group" aria-label="Page" className="mt-4 flex flex-wrap gap-2">
        {TABS.map((t) => (
          <button key={t.key} type="button" aria-pressed={tab === t.key} onClick={() => setTab(t.key)} className={`rounded-full px-4 py-1.5 text-sm font-medium ring-1 transition-colors ${tab === t.key ? "bg-brand-gold text-brand-navy ring-brand-gold" : "text-brand-ink/72 ring-brand-line hover:ring-brand-gold/50"}`}>{t.label} · {faq[t.key].length}</button>
        ))}
      </div>
      <ul className="mt-4 space-y-3">
        {list.map((item, i) => (
          <li key={i} className="rounded-2xl border border-brand-line p-3.5">
            <div className="flex items-start gap-2">
              <div className="flex flex-none flex-col">
                <button type="button" disabled={i === 0} onClick={() => move(i, -1)} aria-label="Move up" className="text-brand-ink/50 hover:text-heading disabled:opacity-20"><ChevronUp size={15} /></button>
                <button type="button" disabled={i === list.length - 1} onClick={() => move(i, 1)} aria-label="Move down" className="text-brand-ink/50 hover:text-heading disabled:opacity-20"><ChevronDown size={15} /></button>
              </div>
              <div className="min-w-0 flex-1">
                <input value={item.q} maxLength={FAQ_LIMITS.q} placeholder="Question" onChange={(e) => set(list.map((x, j) => (j === i ? { ...x, q: e.target.value } : x)))} className={`${input} mt-0 font-medium`} />
                <textarea value={item.a} maxLength={FAQ_LIMITS.a} rows={3} placeholder="Answer" onChange={(e) => set(list.map((x, j) => (j === i ? { ...x, a: e.target.value } : x)))} className={`${input} resize-y`} />
              </div>
              <button type="button" onClick={() => set(list.filter((_, j) => j !== i))} aria-label="Delete question" className="flex h-8 w-8 flex-none items-center justify-center rounded-full text-brand-ink/50 hover:bg-red-50 hover:text-red-600"><Trash2 size={14} /></button>
            </div>
          </li>
        ))}
        {list.length === 0 && <li className="rounded-2xl border border-dashed border-brand-line p-5 text-center text-sm text-brand-ink/60">No questions. The section is hidden on that page.</li>}
      </ul>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button type="button" disabled={list.length >= FAQ_LIMITS.items} onClick={() => set([...list, { q: "", a: "" }])} className="inline-flex items-center gap-1.5 rounded-full border border-brand-line px-4 py-2 text-sm font-semibold text-heading hover:border-brand-gold disabled:opacity-40"><Plus size={14} /> Add a question</button>
        <button type="button" onClick={() => setFaq((f) => ({ ...f, [tab]: DEFAULT_FAQ[tab] }))} className="text-sm font-medium text-brand-ink/66 underline">Restore the original list</button>
        <span className="flex-1" />
        <Note msg={msg} />
        <button type="button" disabled={busy} onClick={() => save({ faq })} className="rounded-full bg-brand-navy px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-navy-light disabled:opacity-50 dark:bg-brand-gold dark:text-brand-navy">{busy ? "Saving…" : "Save questions"}</button>
      </div>
    </div>
  );
}

function ViewingEditor({ initial }: { initial: ViewingSettings }) {
  const [v, setV] = useState(initial);
  const { busy, msg, save } = useSave();
  const toggle = <T,>(arr: T[], x: T) => (arr.includes(x) ? arr.filter((y) => y !== x) : [...arr, x]);

  return (
    <div className="glass shimmer-border rounded-3xl p-5 sm:p-6">
      <h2 className="text-base font-semibold text-heading">Viewing slots</h2>
      <p className="mt-0.5 text-xs text-brand-ink/66">What a visitor can choose when booking a viewing on a property page.</p>
      <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-brand-ink/66">Times offered</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {ALL_TIMES.map((t) => (
          <button key={t} type="button" aria-pressed={v.times.includes(t)} onClick={() => setV({ ...v, times: toggle(v.times, t) })} className={`rounded-full border px-3.5 py-1.5 text-sm font-medium tabular-nums transition-colors ${v.times.includes(t) ? "border-brand-gold bg-brand-gold text-brand-navy" : "border-brand-line text-brand-ink/72 hover:border-brand-gold/60"}`}>{t}</button>
        ))}
      </div>
      <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-brand-ink/66">Days closed for viewings</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {DAYS.map((d, i) => (
          <button key={d} type="button" aria-pressed={v.closedWeekdays.includes(i)} onClick={() => setV({ ...v, closedWeekdays: toggle(v.closedWeekdays, i) })} className={`rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors ${v.closedWeekdays.includes(i) ? "border-red-400 bg-red-500/10 text-red-600" : "border-brand-line text-brand-ink/72 hover:border-brand-gold/60"}`}>{d}</button>
        ))}
      </div>
      <label className="mt-4 block text-xs font-semibold uppercase tracking-wide text-brand-ink/66">
        How many days ahead can people book?
        <select value={v.days} onChange={(e) => setV({ ...v, days: Number(e.target.value) })} className={`${input} w-40 normal-case`}>
          {[3, 5, 7, 10, 14, 21].map((n) => <option key={n} value={n}>{n} days</option>)}
        </select>
      </label>
      <div className="mt-4 flex items-center gap-3">
        <Note msg={msg} />
        <span className="flex-1" />
        <button type="button" disabled={busy} onClick={() => save({ viewing: v })} className="rounded-full bg-brand-navy px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-navy-light disabled:opacity-50 dark:bg-brand-gold dark:text-brand-navy">{busy ? "Saving…" : "Save viewing slots"}</button>
      </div>
    </div>
  );
}

function NotifyCard({ channels }: { channels: { telegram: boolean; email: boolean } }) {
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const any = channels.telegram || channels.email;
  async function test() {
    setBusy(true);
    setMsg(null);
    try {
      const res = await fetch("/api/admin/notify-test", { method: "POST" });
      const data = await res.json().catch(() => ({}));
      setMsg(res.ok ? { ok: true, text: "Test sent — check your Telegram / email in a few seconds." } : { ok: false, text: data.error ?? "Couldn't send." });
    } catch {
      setMsg({ ok: false, text: "Something went wrong." });
    } finally {
      setBusy(false);
    }
  }
  const dot = (on: boolean) => <span className={`inline-block h-2.5 w-2.5 rounded-full ${on ? "bg-emerald-500" : "bg-brand-ink/20"}`} />;
  return (
    <div className="glass shimmer-border rounded-3xl p-5 sm:p-6">
      <h2 className="flex items-center gap-2 text-base font-semibold text-heading"><Bell size={16} className="text-gold-ink" /> Notifications for new messages</h2>
      <p className="mt-0.5 text-xs text-brand-ink/66">Each channel turns on by itself once its secrets are set on the Worker (see the README).</p>
      <ul className="mt-3 space-y-1.5 text-sm text-heading">
        <li className="flex items-center gap-2">{dot(channels.telegram)} Telegram {channels.telegram ? "is on" : "is not set up"}</li>
        <li className="flex items-center gap-2">{dot(channels.email)} Email {channels.email ? "is on" : "is not set up"}</li>
      </ul>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button type="button" disabled={busy || !any} onClick={test} className="rounded-full bg-brand-navy px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-navy-light disabled:opacity-40 dark:bg-brand-gold dark:text-brand-navy">{busy ? "Sending…" : "Send a test"}</button>
        <Note msg={msg} />
      </div>
    </div>
  );
}

export default function AdminSettingsPanel({ faq, viewing, channels }: { faq: FaqSet; viewing: ViewingSettings; channels: { telegram: boolean; email: boolean } }) {
  return (
    <div className="space-y-6">
      <NotifyCard channels={channels} />
      <ViewingEditor initial={viewing} />
      <FaqEditor initial={faq} />
    </div>
  );
}
