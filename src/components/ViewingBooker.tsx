"use client";

import { useState, useSyncExternalStore } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CalendarCheck, CheckCircle2, Loader2 } from "lucide-react";

const TIMES = ["10:00", "12:00", "14:00", "16:00", "18:00"];
const noSub = () => () => {};

/** The next ten days, in Dubai time (UTC+4), as { value: "YYYY-MM-DD", day, date }. Computed in the browser, so a cached page never shows old days. */
function nextDays() {
  const out: { value: string; day: string; date: string }[] = [];
  const base = Date.now() + 4 * 3600 * 1000;
  for (let i = 0; i < 10; i++) {
    const d = new Date(base + i * 86400000);
    out.push({
      value: d.toISOString().slice(0, 10),
      day: i === 0 ? "Today" : d.toLocaleDateString("en-GB", { weekday: "short", timeZone: "UTC" }),
      date: d.toLocaleDateString("en-GB", { day: "numeric", month: "short", timeZone: "UTC" }),
    });
  }
  return out;
}

/**
 * "Book a viewing" on a listing: pick a day and a time, leave your details, and it arrives in the admin inbox
 * (and the team's notification) as a viewing request. The team confirms by phone or WhatsApp.
 */
export default function ViewingBooker({ title, location, path }: { title: string; location: string; path: string }) {
  const isClient = useSyncExternalStore(noSub, () => true, () => false);
  const days = isClient ? nextDays() : [];
  const [day, setDay] = useState("");
  const [time, setTime] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "sent">("idle");
  const [error, setError] = useState("");
  const [website, setWebsite] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!day || !time) return setError("Pick a day and a time.");
    if (!name.trim()) return setError("Please enter your name.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return setError("Please enter a valid email address.");
    setError("");
    setState("sending");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, phone, topic: "Book a viewing", message: `I'd like to view: ${title} (${location}) on ${day} at ${time}.`, source: path, viewing: `${day} ${time}`, website }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "Couldn't send right now. Please try again.");
        setState("idle");
        return;
      }
      setState("sent");
    } catch {
      setError("Couldn't send right now. Please try again, or use WhatsApp.");
      setState("idle");
    }
  }

  const field = "w-full rounded-xl border border-brand-line bg-surface px-3.5 py-2.5 text-sm outline-none transition-colors focus:border-brand-gold";

  return (
    <div className="glass shimmer-border rounded-3xl p-6">
      <h2 className="flex items-center gap-2 text-lg font-semibold text-heading"><CalendarCheck size={18} className="text-gold-ink" /> Book a viewing</h2>
      <AnimatePresence mode="wait" initial={false}>
        {state === "sent" ? (
          <motion.div key="done" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-4 rounded-2xl bg-emerald-500/10 p-5 text-center">
            <CheckCircle2 className="mx-auto text-emerald-500" size={28} />
            <p className="mt-2 text-sm font-semibold text-heading">Request received</p>
            <p className="mt-1 text-sm text-brand-ink/70">We will confirm {day} at {time} by phone or WhatsApp.</p>
          </motion.div>
        ) : (
          <motion.form key="form" onSubmit={submit} noValidate className="mt-3 space-y-3">
            <p className="text-sm text-brand-ink/66">Choose a day and time that suits you. We will confirm.</p>
            <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden" role="group" aria-label="Day">
              {(days.length ? days : Array.from({ length: 7 }, () => null)).map((d, i) =>
                d ? (
                  <button key={d.value} type="button" aria-pressed={day === d.value} onClick={() => setDay(d.value)} className={`flex-none rounded-xl border px-3 py-2 text-center transition-colors ${day === d.value ? "border-brand-gold bg-brand-gold text-brand-navy" : "border-brand-line text-brand-ink/80 hover:border-brand-gold/60"}`}>
                    <span className="block text-[11px] font-semibold uppercase">{d.day}</span>
                    <span className="block text-sm font-semibold tabular-nums">{d.date}</span>
                  </button>
                ) : (
                  <span key={i} className="h-[3.1rem] w-14 flex-none animate-pulse rounded-xl bg-brand-ink/[0.06]" />
                )
              )}
            </div>
            <div className="flex flex-wrap gap-2" role="group" aria-label="Time">
              {TIMES.map((t) => (
                <button key={t} type="button" aria-pressed={time === t} onClick={() => setTime(t)} className={`rounded-full border px-3.5 py-1.5 text-sm font-medium tabular-nums transition-colors ${time === t ? "border-brand-gold bg-brand-gold text-brand-navy" : "border-brand-line text-brand-ink/80 hover:border-brand-gold/60"}`}>{t}</button>
              ))}
            </div>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name" autoComplete="name" className={field} />
            <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="Email address" autoComplete="email" className={field} />
            <input value={phone} onChange={(e) => setPhone(e.target.value)} type="tel" placeholder="Phone / WhatsApp (optional)" autoComplete="tel" className={field} />
            <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden"><input tabIndex={-1} autoComplete="off" value={website} onChange={(e) => setWebsite(e.target.value)} /></div>
            {error && <p role="alert" className="text-sm font-medium text-red-600">{error}</p>}
            <button type="submit" disabled={state === "sending"} className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-brand-gold px-6 py-3 text-sm font-semibold text-brand-navy shadow-[0_8px_24px_-8px_rgba(219,204,59,0.6)] transition-transform hover:scale-[1.02] disabled:cursor-wait disabled:opacity-70">
              {state === "sending" ? <Loader2 size={16} className="animate-spin" /> : <CalendarCheck size={16} />} Request this viewing
            </button>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}
