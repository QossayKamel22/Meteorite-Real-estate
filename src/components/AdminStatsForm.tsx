"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Building2, CheckCircle2, Eye, EyeOff, Trophy, Smile, Users, type LucideIcon } from "lucide-react";
import type { StatKey } from "@/lib/site-stats";

type Field = { key: StatKey; label: string; value: number; visible: boolean };

const ICONS: Record<StatKey, LucideIcon> = {
  propertiesSubmitted: Building2,
  professionalAgents: Users,
  successStories: Trophy,
  happyCustomers: Smile,
};

export default function AdminStatsForm({ fields }: { fields: Field[] }) {
  const router = useRouter();
  const initialValues = useMemo(
    () => Object.fromEntries(fields.map((f) => [f.key, f.value])) as Record<StatKey, number>,
    [fields]
  );
  const initialVisibility = useMemo(
    () => Object.fromEntries(fields.map((f) => [f.key, f.visible])) as Record<StatKey, boolean>,
    [fields]
  );
  const [values, setValues] = useState<Record<StatKey, number>>(initialValues);
  const [visibility, setVisibility] = useState<Record<StatKey, boolean>>(initialVisibility);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  const isDirty = fields.some(
    (f) => values[f.key] !== initialValues[f.key] || visibility[f.key] !== initialVisibility[f.key]
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSaved(false);
    try {
      const res = await fetch("/api/admin/stats", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...values, visibility }),
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

  function handleReset() {
    setValues(initialValues);
    setVisibility(initialVisibility);
    setError("");
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        {fields.map((field) => {
          const Icon = ICONS[field.key];
          const changed =
            values[field.key] !== initialValues[field.key] ||
            visibility[field.key] !== initialVisibility[field.key];
          const isVisible = visibility[field.key];
          return (
            <div
              key={field.key}
              className={`rounded-2xl border p-5 transition-colors ${
                changed ? "border-brand-gold/50 bg-brand-gold/5" : "border-brand-line bg-surface"
              } ${!isVisible ? "opacity-60" : ""}`}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-gold/15 text-brand-gold">
                    <Icon size={15} strokeWidth={1.75} />
                  </span>
                  <label htmlFor={field.key} className="text-sm font-medium text-brand-ink/70">
                    {field.label}
                  </label>
                </div>
                <button
                  type="button"
                  onClick={() => setVisibility((v) => ({ ...v, [field.key]: !v[field.key] }))}
                  aria-label={isVisible ? `Hide ${field.label}` : `Show ${field.label}`}
                  title={isVisible ? "Hide from public site" : "Show on public site"}
                  className="flex h-7 w-7 flex-none items-center justify-center rounded-full text-brand-ink/40 hover:bg-brand-paper hover:text-heading"
                >
                  {isVisible ? <Eye size={14} /> : <EyeOff size={14} />}
                </button>
              </div>
              <div className="mt-3 flex items-baseline gap-2">
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
                  className="w-full rounded-xl border border-brand-line bg-background px-4 py-2.5 text-lg font-semibold tracking-tight text-heading outline-none focus:border-brand-gold"
                />
                <span className="text-lg font-semibold text-brand-ink/40">+</span>
              </div>
              {values[field.key] !== initialValues[field.key] && (
                <p className="mt-1.5 text-xs text-brand-ink/45">
                  Was {initialValues[field.key].toLocaleString()}
                </p>
              )}
              {!isVisible && <p className="mt-1.5 text-xs font-semibold text-brand-ink/40">Hidden</p>}
            </div>
          );
        })}
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
            onClick={handleReset}
            className="text-sm font-medium text-brand-ink/50 hover:text-heading"
          >
            Discard changes
          </button>
        )}
      </div>
    </form>
  );
}
