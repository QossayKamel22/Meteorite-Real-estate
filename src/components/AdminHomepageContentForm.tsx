"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import type { HomepageContent } from "@/lib/homepage-content";

export default function AdminHomepageContentForm({ content }: { content: HomepageContent }) {
  const router = useRouter();
  const [form, setForm] = useState(content);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  const isDirty =
    form.heroBadge !== content.heroBadge ||
    form.heroHeadline !== content.heroHeadline ||
    form.heroSubheadline !== content.heroSubheadline;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSaved(false);
    try {
      const res = await fetch("/api/admin/homepage-content", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
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
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="block text-xs font-medium text-brand-ink/60">Badge text</label>
        <input
          value={form.heroBadge}
          maxLength={80}
          onChange={(e) => setForm((f) => ({ ...f, heroBadge: e.target.value }))}
          className="mt-1 w-full rounded-lg border border-brand-line bg-background px-3 py-2 text-sm outline-none focus:border-brand-gold"
        />
        <p className="mt-1 text-[11px] text-brand-ink/40">
          Shown as the small pill above the headline (e.g. &quot;RERA-Certified · Trusted Since 2005&quot;).
        </p>
      </div>

      <div>
        <label className="block text-xs font-medium text-brand-ink/60">Headline</label>
        <input
          value={form.heroHeadline}
          maxLength={120}
          onChange={(e) => setForm((f) => ({ ...f, heroHeadline: e.target.value }))}
          className="mt-1 w-full rounded-lg border border-brand-line bg-background px-3 py-2 text-base font-semibold text-heading outline-none focus:border-brand-gold"
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-brand-ink/60">Subheadline</label>
        <textarea
          value={form.heroSubheadline}
          maxLength={320}
          rows={3}
          onChange={(e) => setForm((f) => ({ ...f, heroSubheadline: e.target.value }))}
          className="mt-1 w-full rounded-lg border border-brand-line bg-background px-3 py-2 text-sm outline-none focus:border-brand-gold"
        />
      </div>

      {error && <p className="text-sm font-medium text-red-600">{error}</p>}
      {saved && (
        <p className="flex items-center gap-2 text-sm font-medium text-emerald-600">
          <CheckCircle2 size={16} /> Saved — the homepage now reflects this copy.
        </p>
      )}

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={saving || !isDirty}
          className="rounded-full bg-brand-navy px-6 py-3 text-[15px] font-semibold text-white transition-colors hover:bg-brand-navy-light disabled:cursor-not-allowed disabled:opacity-40"
        >
          {saving ? "Saving…" : "Save changes"}
        </button>
        {isDirty && !saving && (
          <button
            type="button"
            onClick={() => setForm(content)}
            className="text-sm font-medium text-brand-ink/50 hover:text-heading"
          >
            Discard changes
          </button>
        )}
      </div>
    </form>
  );
}
