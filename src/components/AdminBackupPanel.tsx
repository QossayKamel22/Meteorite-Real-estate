"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, Download, Loader2 } from "lucide-react";
import { BACKUP_COLLECTIONS, BACKUP_KEY } from "@/lib/backup-shared";

type Doc = { id: string; data: Record<string, unknown> };

/** Reads every collection page by page (each page is its own small request) and saves one JSON file on this computer. */
export default function AdminBackupPanel() {
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState<Record<string, number>>({});
  const [current, setCurrent] = useState("");
  const [error, setError] = useState("");
  const [last, setLast] = useState<string | null>(null);

  useEffect(() => {
    try {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time read of when the last backup was made on this device
      setLast(localStorage.getItem(BACKUP_KEY));
    } catch {
      /* ignore */
    }
  }, []);

  async function run() {
    setRunning(true);
    setError("");
    setDone({});
    const out: Record<string, Doc[]> = {};
    try {
      for (const c of BACKUP_COLLECTIONS) {
        setCurrent(c.label);
        const docs: Doc[] = [];
        let token: string | null = null;
        do {
          const res: Response = await fetch(`/api/admin/backup?collection=${c.name}${token ? `&token=${encodeURIComponent(token)}` : ""}`);
          if (!res.ok) throw new Error(`${c.label}: could not be read (${res.status}). Try again.`);
          const page = (await res.json()) as { docs: Doc[]; next: string | null };
          docs.push(...page.docs);
          token = page.next;
        } while (token);
        out[c.name] = docs;
        setDone((d) => ({ ...d, [c.name]: docs.length }));
      }
      const stamp = new Date().toISOString();
      const blob = new Blob([JSON.stringify({ site: "meteoriterealestate.com", createdAt: stamp, collections: out })], { type: "application/json" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `meteorite-backup-${stamp.slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(a.href);
      try {
        localStorage.setItem(BACKUP_KEY, stamp);
      } catch {
        /* ignore */
      }
      setLast(stamp);
      setCurrent("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setRunning(false);
    }
  }

  return (
    <div className="glass shimmer-border rounded-3xl p-6">
      <p className="text-sm text-brand-ink/72">
        {last ? <>Last backup made on this computer: <span className="font-semibold text-heading">{new Date(last).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" })}</span>.</> : "No backup has been made on this computer yet."} Keep the file somewhere safe (it contains customer messages). Doing it about once a week is a good habit.
      </p>
      <button type="button" onClick={run} disabled={running} className="mt-5 inline-flex items-center gap-2 rounded-full bg-brand-gold px-6 py-3 text-sm font-semibold text-brand-navy shadow-[0_8px_24px_-8px_rgba(219,204,59,0.6)] transition-transform hover:scale-[1.02] disabled:cursor-wait disabled:opacity-70">
        {running ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />} {running ? `Reading ${current}…` : "Download a backup"}
      </button>
      {error && <p role="alert" className="mt-3 text-sm font-medium text-red-600">{error}</p>}
      {(running || Object.keys(done).length > 0) && (
        <ul className="mt-5 grid gap-x-6 gap-y-1.5 sm:grid-cols-2">
          {BACKUP_COLLECTIONS.map((c) => (
            <li key={c.name} className="flex items-center gap-2 text-sm text-brand-ink/72">
              {c.name in done ? <CheckCircle2 size={15} className="text-emerald-500" /> : <span className="h-3.5 w-3.5 rounded-full border border-brand-line" />}
              <span className="flex-1">{c.label}</span>
              <span className="tabular-nums text-brand-ink/60">{done[c.name] ?? ""}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
