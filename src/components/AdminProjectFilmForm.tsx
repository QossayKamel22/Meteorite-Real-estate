"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Plus, Trash2 } from "lucide-react";
import {
  FILM_LIMITS,
  MAX_FILM_FACTS,
  getFilmEmbedUrl,
  parseProjectFilm,
  type ProjectFilm,
} from "@/lib/project-film-shared";

const inputClass =
  "mt-1 w-full rounded-lg border border-brand-line bg-background px-3 py-2 text-sm outline-none focus:border-brand-gold";
const labelClass = "block text-xs font-medium text-brand-ink/60";

/** Admin form for the homepage "Project film" section: video link, text, key facts and visibility. */
export default function AdminProjectFilmForm({ film }: { film: ProjectFilm }) {
  const router = useRouter();
  const [initial, setInitial] = useState<ProjectFilm>(() => ({ ...film, facts: film.facts.map((f) => ({ ...f })) }));
  const [form, setForm] = useState<ProjectFilm>(initial);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  const isDirty = JSON.stringify(form) !== JSON.stringify(initial);
  const set = <K extends keyof ProjectFilm>(key: K, value: ProjectFilm[K]) => setForm((f) => ({ ...f, [key]: value }));
  const setFact = (i: number, key: "value" | "label", value: string) =>
    setForm((f) => ({ ...f, facts: f.facts.map((x, idx) => (idx === i ? { ...x, [key]: value } : x)) }));
  const linkOk = form.videoUrl.trim() === "" || getFilmEmbedUrl(form.videoUrl) !== null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSaved(false);
    const check = parseProjectFilm(form);
    if (!check.ok) {
      setError(check.error);
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/admin/project-film", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(check.value),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "Failed to save.");
        return;
      }
      const next = { ...check.value, facts: check.value.facts.map((f) => ({ ...f })) };
      setInitial(next);
      setForm(next);
      setSaved(true);
      router.refresh();
      window.setTimeout(() => setSaved(false), 3500);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      <label className="flex cursor-pointer items-center justify-between gap-4 rounded-xl border border-brand-line px-4 py-3">
        <span>
          <span className="block text-sm font-semibold text-heading">Show this section on the homepage</span>
          <span className="block text-xs text-brand-ink/50">
            {form.visible ? "Visible, right after Faces & Places." : "Hidden — visitors won't see this section."}
          </span>
        </span>
        <input
          type="checkbox"
          role="switch"
          aria-label="Show the project film on the homepage"
          checked={form.visible}
          onChange={(e) => set("visible", e.target.checked)}
          className="peer sr-only"
        />
        <span
          aria-hidden="true"
          className="relative h-6 w-11 flex-none rounded-full bg-brand-ink/20 transition-colors after:absolute after:left-0.5 after:top-0.5 after:h-5 after:w-5 after:rounded-full after:bg-white after:shadow after:transition-transform peer-checked:bg-brand-gold peer-checked:after:translate-x-5 peer-focus-visible:ring-2 peer-focus-visible:ring-brand-gold"
        />
      </label>

      <div>
        <label className={labelClass}>Video link (Google Drive, YouTube or Vimeo)</label>
        <input
          type="url"
          value={form.videoUrl}
          maxLength={FILM_LIMITS.videoUrl}
          placeholder="https://drive.google.com/file/d/…/view"
          onChange={(e) => set("videoUrl", e.target.value)}
          className={`${inputClass} ${linkOk ? "" : "border-red-400"}`}
        />
        <p className={`mt-1 text-[11px] ${linkOk ? "text-brand-ink/40" : "font-medium text-red-600"}`}>
          {linkOk
            ? "For Drive: share the file as “Anyone with the link can view”, then paste its link. Landscape videos look best."
            : "That isn't a Google Drive, YouTube or Vimeo link."}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={labelClass}>Title</label>
          <input value={form.title} maxLength={FILM_LIMITS.title} onChange={(e) => set("title", e.target.value)} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Small label above the title</label>
          <input value={form.kicker} maxLength={FILM_LIMITS.kicker} onChange={(e) => set("kicker", e.target.value)} className={inputClass} />
        </div>
      </div>

      <div>
        <label className={labelClass}>Location</label>
        <input value={form.location} maxLength={FILM_LIMITS.location} onChange={(e) => set("location", e.target.value)} className={inputClass} />
      </div>

      <div>
        <div className="flex items-center justify-between">
          <label className={labelClass}>Description</label>
          <span className="text-[11px] text-brand-ink/40">
            {form.description.length} / {FILM_LIMITS.description}
          </span>
        </div>
        <textarea
          value={form.description}
          rows={5}
          maxLength={FILM_LIMITS.description}
          onChange={(e) => set("description", e.target.value)}
          className={`${inputClass} leading-relaxed`}
        />
      </div>

      <div>
        <div className="flex items-center justify-between">
          <label className={labelClass}>Key facts (up to {MAX_FILM_FACTS})</label>
          {form.facts.length < MAX_FILM_FACTS && (
            <button
              type="button"
              onClick={() => set("facts", [...form.facts, { value: "", label: "" }])}
              className="inline-flex items-center gap-1 text-xs font-semibold text-brand-gold hover:underline"
            >
              <Plus size={12} /> Add fact
            </button>
          )}
        </div>
        <div className="mt-2 space-y-2">
          {form.facts.map((fact, i) => (
            <div key={i} className="grid grid-cols-[1fr_1fr_auto] items-center gap-2">
              <input
                aria-label={`Fact ${i + 1} figure`}
                value={fact.value}
                maxLength={FILM_LIMITS.factValue}
                placeholder="12"
                onChange={(e) => setFact(i, "value", e.target.value)}
                className={inputClass.replace("mt-1 ", "")}
              />
              <input
                aria-label={`Fact ${i + 1} label`}
                value={fact.label}
                maxLength={FILM_LIMITS.factLabel}
                placeholder="Towers"
                onChange={(e) => setFact(i, "label", e.target.value)}
                className={inputClass.replace("mt-1 ", "")}
              />
              <button
                type="button"
                aria-label={`Remove fact ${i + 1}`}
                onClick={() => set("facts", form.facts.filter((_, idx) => idx !== i))}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-brand-ink/40 hover:bg-red-500/10 hover:text-red-600"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {error && <p className="text-sm font-medium text-red-600">{error}</p>}
      {saved && (
        <p className="flex items-center gap-2 text-sm font-medium text-emerald-600">
          <CheckCircle2 size={16} /> Saved — the homepage will update within a minute.
        </p>
      )}

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={saving || !isDirty}
          className="rounded-full bg-brand-navy px-6 py-3 text-[15px] font-semibold text-white transition-colors hover:bg-brand-navy-light disabled:cursor-not-allowed disabled:opacity-40 dark:bg-brand-gold dark:text-brand-navy dark:hover:bg-brand-gold-soft"
        >
          {saving ? "Saving…" : "Save changes"}
        </button>
        {isDirty && !saving && (
          <button
            type="button"
            onClick={() => {
              setForm(initial);
              setError("");
            }}
            className="text-sm font-medium text-brand-ink/50 hover:text-heading"
          >
            Discard changes
          </button>
        )}
      </div>
    </form>
  );
}
