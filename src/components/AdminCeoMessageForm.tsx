"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Trash2 } from "lucide-react";
import { CEO_MESSAGE_MAX_WORDS, countWords, type CeoMessage } from "@/lib/ceo-message-shared";

const inputClass =
  "mt-1 w-full rounded-lg border border-brand-line bg-background px-3 py-2 text-sm outline-none focus:border-brand-gold";

export default function AdminCeoMessageForm({ message }: { message: CeoMessage }) {
  const router = useRouter();
  const [form, setForm] = useState(message);
  const [busy, setBusy] = useState<"save" | "delete" | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const words = countWords(form.text);
  const overLimit = words > CEO_MESSAGE_MAX_WORDS;
  const isLive = message.text.trim().length > 0;
  const isDirty =
    form.text !== message.text ||
    form.signerTitle !== message.signerTitle ||
    form.company !== message.company;

  async function request(method: "PUT" | "DELETE", action: "save" | "delete") {
    setBusy(action);
    setError("");
    setNotice("");
    try {
      const res = await fetch("/api/admin/ceo-message", {
        method,
        headers: { "Content-Type": "application/json" },
        body: method === "PUT" ? JSON.stringify(form) : undefined,
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong.");
        return false;
      }
      router.refresh();
      return true;
    } catch {
      setError("Something went wrong. Please try again.");
      return false;
    } finally {
      setBusy(null);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (await request("PUT", "save")) {
      setNotice("Saved — the homepage now shows this message.");
      window.setTimeout(() => setNotice(""), 3000);
    }
  }

  async function handleDelete() {
    if (!window.confirm("Remove the CEO message from the homepage?")) return;
    if (await request("DELETE", "delete")) {
      setForm((f) => ({ ...f, text: "" }));
      setNotice("Message removed from the homepage. Write a new one below to bring it back.");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {!isLive && (
        <p className="rounded-lg bg-amber-500/10 px-3 py-2 text-sm text-amber-700 dark:text-amber-300">
          No message is showing on the homepage right now.
        </p>
      )}

      <div>
        <div className="flex items-center justify-between">
          <label className="block text-xs font-medium text-brand-ink/60">Message</label>
          <span
            className={`text-xs font-medium ${overLimit ? "text-red-600" : "text-brand-ink/40"}`}
          >
            {words} / {CEO_MESSAGE_MAX_WORDS} words
          </span>
        </div>
        <textarea
          value={form.text}
          rows={9}
          onChange={(e) => setForm((f) => ({ ...f, text: e.target.value }))}
          className={`${inputClass} leading-relaxed`}
        />
        <p className="mt-1 text-[11px] text-brand-ink/40">
          Leave a blank line between paragraphs. The first paragraph is shown larger.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-xs font-medium text-brand-ink/60">Signed as</label>
          <input
            value={form.signerTitle}
            maxLength={60}
            onChange={(e) => setForm((f) => ({ ...f, signerTitle: e.target.value }))}
            className={inputClass}
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-brand-ink/60">Company</label>
          <input
            value={form.company}
            maxLength={80}
            onChange={(e) => setForm((f) => ({ ...f, company: e.target.value }))}
            className={inputClass}
          />
        </div>
      </div>

      {error && <p className="text-sm font-medium text-red-600">{error}</p>}
      {notice && (
        <p className="flex items-center gap-2 text-sm font-medium text-emerald-600">
          <CheckCircle2 size={16} /> {notice}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={busy !== null || !isDirty || overLimit || !form.text.trim()}
          className="rounded-full bg-brand-navy px-6 py-3 text-[15px] font-semibold text-white transition-colors hover:bg-brand-navy-light disabled:cursor-not-allowed disabled:opacity-40"
        >
          {busy === "save" ? "Saving…" : "Save message"}
        </button>
        {isDirty && busy === null && (
          <button
            type="button"
            onClick={() => setForm(message)}
            className="text-sm font-medium text-brand-ink/50 hover:text-heading"
          >
            Discard changes
          </button>
        )}
        {isLive && (
          <button
            type="button"
            onClick={handleDelete}
            disabled={busy !== null}
            className="ml-auto inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-500/10 disabled:opacity-40"
          >
            <Trash2 size={14} /> {busy === "delete" ? "Removing…" : "Delete message"}
          </button>
        )}
      </div>
    </form>
  );
}
