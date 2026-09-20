"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ChevronDown, ChevronUp, ExternalLink, Eye, EyeOff, Pencil, Plus, Trash2, X } from "lucide-react";
import type { Property, PropertyInput } from "@/lib/properties-data";
import ImageUploadField from "@/components/ImageUploadField";

type FormState = {
  title: string;
  purpose: "sale" | "rent";
  price: string;
  rentFrequency: "yearly" | "monthly";
  type: string;
  isStudio: boolean;
  bedrooms: string;
  bathrooms: string;
  sizeSqft: string;
  location: string;
  description: string;
  amenities: string;
  image: string;
  visible: boolean;
};

const EMPTY_FORM: FormState = {
  title: "",
  purpose: "sale",
  price: "",
  rentFrequency: "yearly",
  type: "Apartment",
  isStudio: false,
  bedrooms: "",
  bathrooms: "",
  sizeSqft: "",
  location: "",
  description: "",
  amenities: "",
  image: "",
  visible: true,
};

function propertyToForm(p: Property): FormState {
  return {
    title: p.title,
    purpose: p.purpose,
    price: String(p.price),
    rentFrequency: p.rentFrequency ?? "yearly",
    type: p.type,
    isStudio: p.isStudio ?? false,
    bedrooms: String(p.bedrooms),
    bathrooms: String(p.bathrooms),
    sizeSqft: String(p.sizeSqft),
    location: p.location,
    description: p.description ?? "",
    amenities: p.amenities?.join("\n") ?? "",
    image: p.image,
    visible: p.visible !== false,
  };
}

function formToPayload(form: FormState): PropertyInput {
  return {
    title: form.title.trim(),
    purpose: form.purpose,
    price: Number(form.price),
    ...(form.purpose === "rent" ? { rentFrequency: form.rentFrequency } : {}),
    type: form.type.trim(),
    isStudio: form.isStudio,
    bedrooms: Number(form.bedrooms) || 0,
    bathrooms: Number(form.bathrooms) || 0,
    sizeSqft: Number(form.sizeSqft),
    location: form.location.trim(),
    description: form.description.trim() || undefined,
    amenities: form.amenities
      .split("\n")
      .map((a) => a.trim())
      .filter(Boolean),
    image: form.image.trim(),
    visible: form.visible,
  } as PropertyInput;
}

function PropertyForm({
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
  const [imageError, setImageError] = useState("");

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.image) {
      setImageError("Please upload a photo.");
      return;
    }
    setSaving(true);
    setError("");
    const err = await onSubmit(form);
    if (err) setError(err);
    setSaving(false);
  }

  return (
    <form onSubmit={handleSubmit} className="mt-4 space-y-3 rounded-xl bg-brand-paper p-4">
      <ImageUploadField
        label="Photo *"
        value={form.image}
        onChange={(dataUrl) => {
          setImageError("");
          set("image", dataUrl);
        }}
        shape="wide"
        maxDimension={1200}
      />
      {imageError && <p className="text-xs font-medium text-red-600">{imageError}</p>}

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="block text-xs font-medium text-brand-ink/60">Title *</label>
          <input
            required
            value={form.title}
            onChange={(e) => set("title", e.target.value)}
            className="mt-1 w-full rounded-lg border border-brand-line bg-background px-3 py-2 text-sm outline-none focus:border-brand-gold"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-brand-ink/60">Purpose *</label>
          <select
            value={form.purpose}
            onChange={(e) => set("purpose", e.target.value as "sale" | "rent")}
            className="mt-1 w-full rounded-lg border border-brand-line bg-background px-3 py-2 text-sm outline-none focus:border-brand-gold"
          >
            <option value="sale">For sale</option>
            <option value="rent">For rent</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-brand-ink/60">Type *</label>
          <input
            required
            value={form.type}
            onChange={(e) => set("type", e.target.value)}
            placeholder="Apartment, Villa, Studio…"
            className="mt-1 w-full rounded-lg border border-brand-line bg-background px-3 py-2 text-sm outline-none focus:border-brand-gold"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-brand-ink/60">
            Price (AED) *{form.purpose === "rent" ? " / " : ""}
          </label>
          <div className="mt-1 flex gap-2">
            <input
              required
              type="number"
              min={1}
              value={form.price}
              onChange={(e) => set("price", e.target.value)}
              className="w-full rounded-lg border border-brand-line bg-background px-3 py-2 text-sm outline-none focus:border-brand-gold"
            />
            {form.purpose === "rent" && (
              <select
                value={form.rentFrequency}
                onChange={(e) => set("rentFrequency", e.target.value as "yearly" | "monthly")}
                className="flex-none rounded-lg border border-brand-line bg-background px-2 py-2 text-sm outline-none focus:border-brand-gold"
              >
                <option value="yearly">/ year</option>
                <option value="monthly">/ month</option>
              </select>
            )}
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-brand-ink/60">Size (sqft) *</label>
          <input
            required
            type="number"
            min={1}
            value={form.sizeSqft}
            onChange={(e) => set("sizeSqft", e.target.value)}
            className="mt-1 w-full rounded-lg border border-brand-line bg-background px-3 py-2 text-sm outline-none focus:border-brand-gold"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-brand-ink/60">Bedrooms</label>
          <input
            type="number"
            min={0}
            disabled={form.isStudio}
            value={form.isStudio ? 0 : form.bedrooms}
            onChange={(e) => set("bedrooms", e.target.value)}
            className="mt-1 w-full rounded-lg border border-brand-line bg-background px-3 py-2 text-sm outline-none focus:border-brand-gold disabled:opacity-50"
          />
          <label className="mt-1.5 flex items-center gap-1.5 text-xs text-brand-ink/60">
            <input
              type="checkbox"
              checked={form.isStudio}
              onChange={(e) => set("isStudio", e.target.checked)}
              className="h-3.5 w-3.5 rounded border-brand-line accent-brand-gold"
            />
            Studio (no separate bedroom)
          </label>
        </div>

        <div>
          <label className="block text-xs font-medium text-brand-ink/60">Bathrooms *</label>
          <input
            required
            type="number"
            min={0}
            value={form.bathrooms}
            onChange={(e) => set("bathrooms", e.target.value)}
            className="mt-1 w-full rounded-lg border border-brand-line bg-background px-3 py-2 text-sm outline-none focus:border-brand-gold"
          />
        </div>

        <div className="sm:col-span-2">
          <label className="block text-xs font-medium text-brand-ink/60">Location *</label>
          <input
            required
            value={form.location}
            onChange={(e) => set("location", e.target.value)}
            className="mt-1 w-full rounded-lg border border-brand-line bg-background px-3 py-2 text-sm outline-none focus:border-brand-gold"
          />
        </div>

        <div className="sm:col-span-2">
          <label className="block text-xs font-medium text-brand-ink/60">Description</label>
          <textarea
            value={form.description}
            onChange={(e) => set("description", e.target.value)}
            rows={3}
            className="mt-1 w-full rounded-lg border border-brand-line bg-background px-3 py-2 text-sm outline-none focus:border-brand-gold"
          />
        </div>

        <div className="sm:col-span-2">
          <label className="block text-xs font-medium text-brand-ink/60">Amenities (one per line)</label>
          <textarea
            value={form.amenities}
            onChange={(e) => set("amenities", e.target.value)}
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
        <button type="button" onClick={onCancel} className="text-sm font-medium text-brand-ink/50 hover:text-heading">
          Cancel
        </button>
      </div>
    </form>
  );
}

function formatPrice(p: Property): string {
  const amount = `AED ${p.price.toLocaleString()}`;
  return p.purpose === "rent" ? `${amount} / ${p.rentFrequency === "monthly" ? "mo" : "yr"}` : amount;
}

export default function AdminPropertiesPanel({ properties }: { properties: Property[] }) {
  const router = useRouter();
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  async function handleAdd(form: FormState): Promise<string | null> {
    const res = await fetch("/api/admin/properties", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formToPayload(form)),
    });
    const data = await res.json();
    if (!res.ok) return data.error ?? "Failed to add property.";
    setAdding(false);
    router.refresh();
    return null;
  }

  async function handleUpdate(id: string, form: FormState): Promise<string | null> {
    const res = await fetch(`/api/admin/properties/${id}`, {
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
    if (!window.confirm("Delete this property? This can't be undone.")) return;
    setDeletingId(id);
    await fetch(`/api/admin/properties/${id}`, { method: "DELETE" });
    router.refresh();
    setDeletingId(null);
  }

  async function handleMove(id: string, direction: "up" | "down") {
    setBusyId(id);
    await fetch(`/api/admin/properties/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ move: direction }),
    });
    router.refresh();
    setBusyId(null);
  }

  async function handleToggleVisible(p: Property) {
    setBusyId(p.id);
    await fetch(`/api/admin/properties/${p.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ visible: !(p.visible !== false) }),
    });
    router.refresh();
    setBusyId(null);
  }

  return (
    <div>
      <ul className="space-y-3">
        {properties.map((p, i) => {
          const visible = p.visible !== false;
          return (
            <li
              key={p.id}
              className={`rounded-2xl border border-brand-line bg-surface p-4 ${!visible ? "opacity-55" : ""}`}
            >
              {editingId === p.id ? (
                <PropertyForm
                  initial={propertyToForm(p)}
                  submitLabel="Save changes"
                  onCancel={() => setEditingId(null)}
                  onSubmit={(form) => handleUpdate(p.id, form)}
                />
              ) : (
                <div className="flex items-center gap-4">
                  <div className="flex flex-none flex-col">
                    <button
                      type="button"
                      onClick={() => handleMove(p.id, "up")}
                      disabled={busyId === p.id || i === 0}
                      aria-label={`Move ${p.title} up`}
                      className="flex h-5 w-5 items-center justify-center text-brand-ink/40 hover:text-heading disabled:opacity-20"
                    >
                      <ChevronUp size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleMove(p.id, "down")}
                      disabled={busyId === p.id || i === properties.length - 1}
                      aria-label={`Move ${p.title} down`}
                      className="flex h-5 w-5 items-center justify-center text-brand-ink/40 hover:text-heading disabled:opacity-20"
                    >
                      <ChevronDown size={14} />
                    </button>
                  </div>
                  <div className="relative h-14 w-20 flex-none overflow-hidden rounded-lg bg-brand-paper">
                    <Image src={p.image} alt={p.title} fill className="object-cover" sizes="80px" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-heading">{p.title}</p>
                    <p className="truncate text-xs text-brand-ink/55">
                      {formatPrice(p)} · {p.type} · {p.location}
                      {!visible && <span className="ml-1.5 font-semibold text-brand-ink/40">· Hidden</span>}
                    </p>
                  </div>
                  {p.sourceUrl && (
                    <a
                      href={p.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="View original Bayut listing"
                      title="View original Bayut listing"
                      className="flex h-8 w-8 flex-none items-center justify-center rounded-full text-brand-ink/40 hover:bg-brand-paper hover:text-heading"
                    >
                      <ExternalLink size={14} />
                    </a>
                  )}
                  <button
                    type="button"
                    onClick={() => handleToggleVisible(p)}
                    disabled={busyId === p.id}
                    aria-label={visible ? `Hide ${p.title}` : `Show ${p.title}`}
                    title={visible ? "Hide from public site" : "Show on public site"}
                    className="flex h-8 w-8 flex-none items-center justify-center rounded-full text-brand-ink/50 hover:bg-brand-paper hover:text-heading disabled:opacity-50"
                  >
                    {visible ? <Eye size={14} /> : <EyeOff size={14} />}
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingId(p.id)}
                    aria-label={`Edit ${p.title}`}
                    className="flex h-8 w-8 flex-none items-center justify-center rounded-full text-brand-ink/50 hover:bg-brand-paper hover:text-heading"
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(p.id)}
                    disabled={deletingId === p.id}
                    aria-label={`Delete ${p.title}`}
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
            <p className="text-sm font-semibold text-heading">New property</p>
            <button type="button" onClick={() => setAdding(false)} aria-label="Close">
              <X size={16} className="text-brand-ink/50" />
            </button>
          </div>
          <PropertyForm
            initial={EMPTY_FORM}
            submitLabel="Add property"
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
          <Plus size={15} /> Add property
        </button>
      )}
    </div>
  );
}
