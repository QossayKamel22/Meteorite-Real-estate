"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import type { GoogleReviewsSummary } from "@/lib/google-reviews-shared";

const inputClass =
  "mt-1 w-full rounded-lg border border-brand-line bg-background px-3 py-2 text-sm outline-none focus:border-brand-gold";

type FormState = { url: string; rating: string; count: string };

function toForm(s: GoogleReviewsSummary): FormState {
  return { url: s.url, rating: String(s.rating), count: s.count === null ? "" : String(s.count) };
}

export default function AdminGoogleReviewsForm({
  summary,
  autoCount,
}: {
  summary: GoogleReviewsSummary;
  /** How many visible Google-sourced testimonials exist — what the site shows while the count is left empty. */
  autoCount: number;
}) {
  const router = useRouter();
  const initial = toForm(summary);
  const [form, setForm] = useState<FormState>(initial);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  const isDirty = form.url !== initial.url || form.rating !== initial.rating || form.count !== initial.count;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSaved(false);
    try {
      const res = await fetch("/api/admin/google-reviews", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: form.url,
          rating: form.rating,
          count: form.count.trim() === "" ? null : form.count.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Failed to save.");
        return;
      }
      setSaved(true);
      router.refresh();
      window.setTimeout(() => setSaved(false), 3000);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-xs font-medium text-brand-ink/60">Rating shown next to the Google icon (1–5)</label>
          <input
            type="number"
            min={1}
            max={5}
            step={0.1}
            value={form.rating}
            onChange={(e) => setForm((f) => ({ ...f, rating: e.target.value }))}
            className={inputClass}
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-brand-ink/60">Number of reviews shown next to the Google icon</label>
          <input
            type="number"
            min={0}
            step={1}
            value={form.count}
            placeholder={`Auto (${autoCount})`}
            onChange={(e) => setForm((f) => ({ ...f, count: e.target.value }))}
            className={inputClass}
          />
          <p className="mt-1 text-[11px] text-brand-ink/40">
            Shown beside the Google icon (e.g. &quot;61 reviews&quot;). Leave empty to use the {autoCount}{" "}
            Google review{autoCount === 1 ? "" : "s"} added below. The &quot;Read all reviews on Google&quot;
            button never shows a count.
          </p>
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-brand-ink/60">Google reviews link</label>
        <input
          type="url"
          value={form.url}
          onChange={(e) => setForm((f) => ({ ...f, url: e.target.value }))}
          className={inputClass}
        />
        <p className="mt-1 text-[11px] text-brand-ink/40">
          Where &quot;Read all reviews on Google&quot; goes — your Google Maps listing or reviews link.
        </p>
      </div>

      {error && <p className="text-sm font-medium text-red-600">{error}</p>}
      {saved && (
        <p className="flex items-center gap-2 text-sm font-medium text-emerald-600">
          <CheckCircle2 size={16} /> Saved — the homepage now shows this.
        </p>
      )}

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={saving || !isDirty}
          className="rounded-full bg-brand-navy px-6 py-3 text-[15px] font-semibold text-white transition-colors hover:bg-brand-navy-light disabled:cursor-not-allowed disabled:opacity-40"
        >
          {saving ? "Saving…" : "Save"}
        </button>
        {isDirty && !saving && (
          <button
            type="button"
            onClick={() => setForm(initial)}
            className="text-sm font-medium text-brand-ink/50 hover:text-heading"
          >
            Discard changes
          </button>
        )}
      </div>
    </form>
  );
}
