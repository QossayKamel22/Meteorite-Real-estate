"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Mail, MessageCircle, Phone, Trash2 } from "lucide-react";
import type { ContactMessage } from "@/lib/messages-shared";

const ago = (iso: string) => {
  const s = Math.max(0, (Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 3600) return `${Math.max(1, Math.round(s / 60))} min ago`;
  if (s < 86400) return `${Math.round(s / 3600)} h ago`;
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
};

/** The inbox: unread first marker, filter, mark read, reply by email or WhatsApp, delete. */
export default function AdminMessagesPanel({ messages }: { messages: ContactMessage[] }) {
  const router = useRouter();
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const [open, setOpen] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState("");
  const shown = useMemo(() => (filter === "unread" ? messages.filter((m) => !m.read) : messages), [messages, filter]);
  const unread = messages.filter((m) => !m.read).length;

  async function call(id: string, init: RequestInit) {
    setBusy(id);
    setError("");
    try {
      const res = await fetch(`/api/admin/messages/${id}`, { headers: { "Content-Type": "application/json" }, ...init });
      if (!res.ok) setError("Couldn't save. Please try again.");
      else router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="glass shimmer-border rounded-3xl p-5 sm:p-6">
      <div className="flex items-center justify-between gap-3">
        <div role="group" aria-label="Filter" className="flex rounded-full bg-brand-ink/[0.06] p-0.5">
          {(["all", "unread"] as const).map((f) => (
            <button key={f} type="button" aria-pressed={filter === f} onClick={() => setFilter(f)} className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-colors ${filter === f ? "bg-brand-gold text-brand-navy" : "text-brand-ink/66 hover:text-heading"}`}>
              {f === "all" ? `All (${messages.length})` : `Unread (${unread})`}
            </button>
          ))}
        </div>
      </div>
      {error && <p className="mt-3 text-sm font-medium text-red-600">{error}</p>}
      {shown.length === 0 ? (
        <p className="mt-6 rounded-2xl border border-dashed border-brand-line p-8 text-center text-sm text-brand-ink/60">{messages.length === 0 ? "No messages yet. They appear here as soon as someone writes from the website." : "Nothing unread."}</p>
      ) : (
        <ul className="mt-4 divide-y divide-brand-line">
          {shown.map((m) => {
            const isOpen = open === m.id;
            const wa = m.phone ? `https://wa.me/${m.phone.replace(/[^\d]/g, "")}` : "";
            return (
              <li key={m.id} className="py-3">
                <button
                  type="button"
                  onClick={() => {
                    setOpen(isOpen ? null : m.id);
                    if (!isOpen && !m.read) void call(m.id, { method: "PATCH", body: JSON.stringify({ read: true }) });
                  }}
                  aria-expanded={isOpen}
                  className="flex w-full items-start gap-3 text-left"
                >
                  <span aria-hidden="true" className={`mt-1.5 h-2.5 w-2.5 flex-none rounded-full ${m.read ? "bg-brand-ink/15" : "bg-brand-gold shadow-[0_0_10px_2px_rgba(219,204,59,0.6)]"}`} />
                  <span className="min-w-0 flex-1">
                    <span className="flex items-baseline justify-between gap-3">
                      <span className={`truncate text-sm ${m.read ? "font-medium text-brand-ink/80" : "font-semibold text-heading"}`}>{m.name}{m.viewing && <span className="ml-2 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-semibold tracking-wide text-emerald-600">🗓 {m.viewing}</span>}{m.topic && <span className="ml-2 rounded-full bg-brand-gold/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-gold-ink">{m.topic}</span>}</span>
                      <span className="flex-none text-xs text-brand-ink/60">{ago(m.createdAt)}</span>
                    </span>
                    <span className={`mt-0.5 block text-sm text-brand-ink/66 ${isOpen ? "" : "line-clamp-1"}`}>{m.message}</span>
                  </span>
                </button>
                {isOpen && (
                  <div className="ml-[1.4rem] mt-3 flex flex-wrap items-center gap-2 text-sm">
                    <a href={`mailto:${m.email}?subject=${encodeURIComponent("Re: your enquiry to Meteorite Real Estate")}`} className="inline-flex items-center gap-1.5 rounded-full bg-brand-navy px-3.5 py-1.5 font-semibold text-white hover:bg-brand-navy-light dark:bg-brand-gold dark:text-brand-navy"><Mail size={14} /> {m.email}</a>
                    {m.phone && <a href={`tel:${m.phone}`} className="inline-flex items-center gap-1.5 rounded-full border border-brand-line px-3.5 py-1.5 font-medium text-heading hover:border-brand-gold"><Phone size={14} /> {m.phone}</a>}
                    {wa && <a href={wa} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 rounded-full border border-brand-line px-3.5 py-1.5 font-medium text-heading hover:border-brand-gold"><MessageCircle size={14} /> WhatsApp</a>}
                    {m.source && <a href={m.source} target="_blank" rel="noopener noreferrer" className="text-xs text-brand-ink/60 underline">From {m.source}</a>}
                    <span className="flex-1" />
                    {m.read && <button type="button" disabled={busy === m.id} onClick={() => call(m.id, { method: "PATCH", body: JSON.stringify({ read: false }) })} className="inline-flex items-center gap-1 text-xs font-medium text-brand-ink/66 hover:text-heading"><Check size={13} /> Mark unread</button>}
                    <button type="button" disabled={busy === m.id} onClick={() => window.confirm("Delete this message?") && call(m.id, { method: "DELETE" })} aria-label="Delete message" className="flex h-8 w-8 items-center justify-center rounded-full text-brand-ink/55 hover:bg-red-50 hover:text-red-600"><Trash2 size={14} /></button>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
