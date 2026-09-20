"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, ChevronUp, Eye, EyeOff, Pencil, Plus, Trash2, X } from "lucide-react";
import type { Testimonial, TestimonialInput } from "@/lib/testimonials-data";

type FormState = { name: string; role: string; quote: string; visible: boolean };

const EMPTY_FORM: FormState = { name: "", role: "", quote: "", visible: true };

function testimonialToForm(t: Testimonial): FormState {
  return { name: t.name, role: t.role, quote: t.quote, visible: t.visible !== false };
}

function formToPayload(form: FormState): TestimonialInput {
  return {
    name: form.name.trim(),
    role: form.role.trim(),
    quote: form.quote.trim(),
    visible: form.visible,
  };
}

function TestimonialForm({
  initial,
  onCancel,
  onSubmit,
  submitLabel,
}: {
  initial: FormState;
  onCancel: () => void;
  onSubmit: (form: FormState) => Promise<string | null>;
  submitLabel: string;
}) {
  const [form, setForm] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    const err = await onSubmit(form);
    if (err) setError(err);
    setSaving(false);
  }

  return (
    <form onSubmit={handleSubmit} className="mt-4 space-y-3 rounded-xl bg-brand-paper p-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="block text-xs font-medium text-brand-ink/60">Name *</label>
          <input
            required
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
            className="mt-1 w-full rounded-lg border border-brand-line bg-background px-3 py-2 text-sm outline-none focus:border-brand-gold"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-brand-ink/60">Role *</label>
          <input
            required
            value={form.role}
            onChange={(e) => set("role", e.target.value)}
            placeholder="Customer"
            className="mt-1 w-full rounded-lg border border-brand-line bg-background px-3 py-2 text-sm outline-none focus:border-brand-gold"
          />
        </div>
        <div className="sm:col-span-2">
          <label className="block text-xs font-medium text-brand-ink/60">Quote *</label>
          <textarea
            required
            value={form.quote}
            onChange={(e) => set("quote", e.target.value)}
            rows={3}
            className="mt-1 w-full rounded-lg border border-brand-line bg-background px-3 py-2 text-sm outline-none focus:border-brand-gold"
          />
        </div>
      </div>

      <label className="flex items-center gap-2 pt-1 text-sm font-medium text-brand-ink/70">
        <input
          type="checkbox"
          checked={form.visible}
          onChange={(e) => set("visible", e.target.checked)}
          className="h-4 w-4 rounded border-brand-line accent-brand-gold"
        />
        Visible on the public site
      </label>

      {error && <p className="text-sm font-medium text-red-600">{error}</p>}

      <div className="flex items-center gap-3 pt-1">
        <button
          type="submit"
          disabled={saving}
          className="rounded-full bg-brand-navy px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-navy-light disabled:opacity-60"
        >
          {saving ? "Saving…" : submitLabel}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="text-sm font-medium text-brand-ink/50 hover:text-heading"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

export default function AdminTestimonialsPanel({ testimonials }: { testimonials: Testimonial[] }) {
  const router = useRouter();
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  async function handleAdd(form: FormState): Promise<string | null> {
    const res = await fetch("/api/admin/testimonials", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formToPayload(form)),
    });
    const data = await res.json();
    if (!res.ok) return data.error ?? "Failed to add testimonial.";
    setAdding(false);
    router.refresh();
    return null;
  }

  async function handleUpdate(id: string, form: FormState): Promise<string | null> {
    const res = await fetch(`/api/admin/testimonials/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formToPayload(form)),
    });
    const data = await res.json();
    if (!res.ok) return data.error ?? "Failed to save.";
    setEditingId(null);
    router.refresh();
    return null;
  }

  async function handleDelete(id: string) {
    setDeletingId(id);
    await fetch(`/api/admin/testimonials/${id}`, { method: "DELETE" });
    router.refresh();
    setDeletingId(null);
  }

  async function handleMove(id: string, direction: "up" | "down") {
    setBusyId(id);
    await fetch(`/api/admin/testimonials/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ move: direction }),
    });
    router.refresh();
    setBusyId(null);
  }

  async function handleToggleVisible(t: Testimonial) {
    setBusyId(t.id);
    await fetch(`/api/admin/testimonials/${t.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ visible: !(t.visible !== false) }),
    });
    router.refresh();
    setBusyId(null);
  }

  return (
    <div>
      <ul className="space-y-3">
        {testimonials.map((t, i) => {
          const visible = t.visible !== false;
          return (
            <li
              key={t.id}
              className={`rounded-2xl border border-brand-line bg-surface p-4 ${!visible ? "opacity-55" : ""}`}
            >
              {editingId === t.id ? (
                <TestimonialForm
                  initial={testimonialToForm(t)}
                  submitLabel="Save changes"
                  onCancel={() => setEditingId(null)}
                  onSubmit={(form) => handleUpdate(t.id, form)}
                />
              ) : (
                <div className="flex items-center gap-4">
                  <div className="flex flex-none flex-col">
                    <button
                      type="button"
                      onClick={() => handleMove(t.id, "up")}
                      disabled={busyId === t.id || i === 0}
                      aria-label={`Move ${t.name} up`}
                      className="flex h-5 w-5 items-center justify-center text-brand-ink/40 hover:text-heading disabled:opacity-20"
                    >
                      <ChevronUp size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleMove(t.id, "down")}
                      disabled={busyId === t.id || i === testimonials.length - 1}
                      aria-label={`Move ${t.name} down`}
                      className="flex h-5 w-5 items-center justify-center text-brand-ink/40 hover:text-heading disabled:opacity-20"
                    >
                      <ChevronDown size={14} />
                    </button>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-heading">
                      {t.name} <span className="font-normal text-brand-ink/50">— {t.role}</span>
                      {!visible && <span className="ml-1.5 font-semibold text-brand-ink/40">· Hidden</span>}
                    </p>
                    <p className="truncate text-xs text-brand-ink/55">{t.quote}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleToggleVisible(t)}
                    disabled={busyId === t.id}
                    aria-label={visible ? `Hide ${t.name}` : `Show ${t.name}`}
                    title={visible ? "Hide from public site" : "Show on public site"}
                    className="flex h-8 w-8 flex-none items-center justify-center rounded-full text-brand-ink/50 hover:bg-brand-paper hover:text-heading disabled:opacity-50"
                  >
                    {visible ? <Eye size={14} /> : <EyeOff size={14} />}
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingId(t.id)}
                    aria-label={`Edit ${t.name}`}
                    className="flex h-8 w-8 flex-none items-center justify-center rounded-full text-brand-ink/50 hover:bg-brand-paper hover:text-heading"
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(t.id)}
                    disabled={deletingId === t.id}
                    aria-label={`Delete ${t.name}`}
                    className="flex h-8 w-8 flex-none items-center justify-center rounded-full text-brand-ink/50 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              )}
            </li>
          );
        })}
      </ul>

      {adding ? (
        <div className="mt-4 rounded-2xl border border-brand-gold/40 bg-surface p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-heading">New testimonial</p>
            <button type="button" onClick={() => setAdding(false)} aria-label="Close">
              <X size={16} className="text-brand-ink/50" />
            </button>
          </div>
          <TestimonialForm
            initial={EMPTY_FORM}
            submitLabel="Add testimonial"
            onCancel={() => setAdding(false)}
            onSubmit={handleAdd}
          />
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setAdding(true)}
          className="mt-4 flex items-center gap-1.5 rounded-full border border-dashed border-brand-line px-4 py-2 text-sm font-medium text-brand-ink/60 hover:border-brand-gold hover:text-heading"
        >
          <Plus size={15} /> Add testimonial
        </button>
      )}
    </div>
  );
}
