"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import ImageUploadField from "@/components/ImageUploadField";
import {
  FEATURED_LIMITS,
  MAX_FACTS,
  parseFeaturedProject,
  type FeaturedProject,
  type FeaturedProjectInput,
} from "@/lib/featured-project-shared";

const inputClass =
  "mt-1 w-full rounded-lg border border-brand-line bg-background px-3 py-2 text-sm outline-none focus:border-brand-gold";
const labelClass = "block text-xs font-medium text-brand-ink/60";

type FormState = FeaturedProjectInput;

export const EMPTY_PROJECT_FORM: FormState = {
  visible: true,
  kicker: "Featured Project",
  name: "",
  location: "",
  description: "",
  facts: [],
  linkUrl: "https://",
  linkLabel: "Explore the project",
  image: "",
};

export function projectToForm(p: FeaturedProject): FormState {
  return {
    visible: p.visible,
    kicker: p.kicker,
    name: p.name,
    location: p.location,
    description: p.description,
    facts: p.facts.map((f) => ({ ...f })),
    linkUrl: p.linkUrl,
    linkLabel: p.linkLabel,
    image: p.image,
  };
}

/**
 * Add / edit form for one featured project. `projectId` set = editing that
 * project (PUT); absent = creating a new one (POST). Calls onSaved() when the
 * server accepts it, so the parent panel can close the form and refresh.
 */
export default function AdminFeaturedProjectForm({
  initial,
  projectId,
  onSaved,
  onCancel,
}: {
  initial: FormState;
  projectId?: string;
  onSaved: () => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState<FormState>(initial);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const isNew = !projectId;
  const isDirty = isNew || JSON.stringify(form) !== JSON.stringify(initial);
  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  function setFact(i: number, key: "value" | "label", value: string) {
    setForm((f) => ({ ...f, facts: f.facts.map((fact, idx) => (idx === i ? { ...fact, [key]: value } : fact)) }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    // Same rules the server enforces, so mistakes are caught before the round trip.
    const check = parseFeaturedProject(form);
    if (!check.ok) {
      setError(check.error);
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(isNew ? "/api/admin/featured-projects" : `/api/admin/featured-projects/${projectId}`, {
        method: isNew ? "POST" : "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(check.value),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "Failed to save.");
        return;
      }
      onSaved();
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
          <span className="block text-sm font-semibold text-heading">Show this project on the homepage</span>
          <span className="block text-xs text-brand-ink/50">
            {form.visible ? "Visible to visitors." : "Hidden — visitors won't see this section."}
          </span>
        </span>
        <input
          type="checkbox"
          role="switch"
          aria-label="Show this project on the homepage"
          checked={form.visible}
          onChange={(e) => set("visible", e.target.checked)}
          className="peer sr-only"
        />
        <span
          aria-hidden="true"
          className="relative h-6 w-11 flex-none rounded-full bg-brand-ink/20 transition-colors after:absolute after:left-0.5 after:top-0.5 after:h-5 after:w-5 after:rounded-full after:bg-white after:shadow after:transition-transform peer-checked:bg-brand-gold peer-checked:after:translate-x-5 peer-focus-visible:ring-2 peer-focus-visible:ring-brand-gold"
        />
      </label>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={labelClass}>Project name</label>
          <input
            value={form.name}
            maxLength={FEATURED_LIMITS.name}
            onChange={(e) => set("name", e.target.value)}
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>Small label above the name</label>
          <input
            value={form.kicker}
            maxLength={FEATURED_LIMITS.kicker}
            onChange={(e) => set("kicker", e.target.value)}
            className={inputClass}
          />
        </div>
      </div>

      <div>
        <label className={labelClass}>Location</label>
        <input
          value={form.location}
          maxLength={FEATURED_LIMITS.location}
          placeholder="e.g. Majan, Dubai"
          onChange={(e) => set("location", e.target.value)}
          className={inputClass}
        />
      </div>

      <div>
        <div className="flex items-center justify-between">
          <label className={labelClass}>Description</label>
          <span className="text-[11px] text-brand-ink/40">
            {form.description.length} / {FEATURED_LIMITS.description}
          </span>
        </div>
        <textarea
          value={form.description}
          rows={5}
          maxLength={FEATURED_LIMITS.description}
          onChange={(e) => set("description", e.target.value)}
          className={`${inputClass} leading-relaxed`}
        />
        <p className="mt-1 text-[11px] text-brand-ink/40">
          Keep it factual and low-key — only things the project&apos;s own website states.
        </p>
      </div>

      <div>
        <div className="flex items-center justify-between">
          <label className={labelClass}>Key facts (up to {MAX_FACTS})</label>
          {form.facts.length < MAX_FACTS && (
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
                maxLength={FEATURED_LIMITS.factValue}
                placeholder="77"
                onChange={(e) => setFact(i, "value", e.target.value)}
                className={inputClass.replace("mt-1 ", "")}
              />
              <input
                aria-label={`Fact ${i + 1} label`}
                value={fact.label}
                maxLength={FEATURED_LIMITS.factLabel}
                placeholder="Curated homes"
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
          {form.facts.length === 0 && <p className="text-xs text-brand-ink/40">No key facts — that row is hidden.</p>}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-[2fr_1fr]">
        <div>
          <label className={labelClass}>Project link</label>
          <input
            type="url"
            value={form.linkUrl}
            maxLength={FEATURED_LIMITS.linkUrl}
            placeholder="https://"
            onChange={(e) => set("linkUrl", e.target.value)}
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>Button text</label>
          <input
            value={form.linkLabel}
            maxLength={FEATURED_LIMITS.linkLabel}
            onChange={(e) => set("linkLabel", e.target.value)}
            className={inputClass}
          />
        </div>
      </div>

      <div>
        <ImageUploadField
          label="Project photo (optional)"
          value={form.image}
          onChange={(dataUrl) => set("image", dataUrl)}
          maxDimension={1400}
          shape="wide"
        />
        {form.image && (
          <button
            type="button"
            onClick={() => set("image", "")}
            className="mt-2 text-xs font-medium text-red-600 hover:underline"
          >
            Remove photo
          </button>
        )}
        <p className="mt-1 text-[11px] text-brand-ink/40">
          Use a photo you have the right to publish. Without one, the section shows a clean typographic panel.
        </p>
      </div>

      {error && <p className="text-sm font-medium text-red-600">{error}</p>}

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={saving || !isDirty}
          className="rounded-full bg-brand-navy px-6 py-3 text-[15px] font-semibold text-white transition-colors hover:bg-brand-navy-light disabled:cursor-not-allowed disabled:opacity-40 dark:bg-brand-gold dark:text-brand-navy dark:hover:bg-brand-gold-soft"
        >
          {saving ? "Saving…" : isNew ? "Add project" : "Save changes"}
        </button>
        <button type="button" onClick={onCancel} className="text-sm font-medium text-brand-ink/50 hover:text-heading">
          Cancel
        </button>
      </div>
    </form>
  );
}
