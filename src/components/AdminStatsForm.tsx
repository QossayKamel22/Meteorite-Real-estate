"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import type { StatKey } from "@/lib/site-stats";

type Field = { key: StatKey; label: string; value: number };

export default function AdminStatsForm({ fields }: { fields: Field[] }) {
  const router = useRouter();
  const [values, setValues] = useState<Record<StatKey, number>>(
    Object.fromEntries(fields.map((f) => [f.key, f.value])) as Record<StatKey, number>
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSaved(false);
    try {
      const res = await fetch("/api/admin/stats", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
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
      <div className="grid gap-5 sm:grid-cols-2">
        {fields.map((field) => (
          <div key={field.key}>
            <label htmlFor={field.key} className="block text-sm font-medium text-brand-ink/70">
              {field.label}
            </label>
            <input
              id={field.key}
              type="number"
              min={0}
              max={1000000}
              step={1}
              required
              value={values[field.key]}
              onChange={(e) =>
                setValues((v) => ({ ...v, [field.key]: Number(e.target.value) }))
              }
              className="mt-1.5 w-full rounded-xl border border-brand-line bg-surface px-4 py-3 text-[15px] outline-none focus:border-brand-gold"
            />
          </div>
        ))}
      </div>

      {error && (
        <p role="alert" className="text-sm font-medium text-red-600">
          {error}
        </p>
      )}
      {saved && (
        <p role="status" className="flex items-center gap-2 text-sm font-medium text-emerald-600">
          <CheckCircle2 size={16} /> Saved — the live site now reflects these numbers.
        </p>
      )}

      <button
        type="submit"
        disabled={saving}
        className="rounded-full bg-brand-navy px-6 py-3 text-[15px] font-semibold text-white transition-colors hover:bg-brand-navy-light disabled:opacity-60"
      >
        {saving ? "Saving…" : "Save changes"}
      </button>
    </form>
  );
}
