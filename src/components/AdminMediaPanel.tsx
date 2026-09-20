"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Eye, EyeOff, ExternalLink, Pencil, Plus, Trash2, X } from "lucide-react";
import type { MediaPlatform, MediaPost, MediaPostInput } from "@/lib/media-posts-data";
import ImageUploadField from "@/components/ImageUploadField";

type FormState = {
  kind: "social" | "post";
  title: string;
  body: string;
  image: string;
  platform: MediaPlatform;
  url: string;
  visible: boolean;
};

const EMPTY_FORM: FormState = {
  kind: "post",
  title: "",
  body: "",
  image: "",
  platform: "instagram",
  url: "",
  visible: true,
};

function postToForm(p: MediaPost): FormState {
  return {
    kind: p.kind,
    title: p.title,
    body: p.body ?? "",
    image: p.image ?? "",
    platform: p.platform ?? "instagram",
    url: p.url ?? "",
    visible: p.visible !== false,
  };
}

function formToPayload(form: FormState): MediaPostInput {
  if (form.kind === "social") {
    return {
      kind: "social",
      title: form.title.trim(),
      url: form.url.trim(),
      platform: form.platform,
      body: form.body.trim() || undefined,
      image: form.image.trim() || undefined,
      visible: form.visible,
    } as MediaPostInput;
  }
  return {
    kind: "post",
    title: form.title.trim(),
    image: form.image.trim(),
    body: form.body.trim() || undefined,
    visible: form.visible,
  } as MediaPostInput;
}

function MediaForm({
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
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => set("kind", "post")}
          className={`flex-1 rounded-lg border px-3 py-2 text-sm font-semibold transition-colors ${
            form.kind === "post" ? "border-brand-gold bg-brand-gold/10 text-heading" : "border-brand-line text-brand-ink/60"
          }`}
        >
          Photo post
        </button>
        <button
          type="button"
          onClick={() => set("kind", "social")}
          className={`flex-1 rounded-lg border px-3 py-2 text-sm font-semibold transition-colors ${
            form.kind === "social" ? "border-brand-gold bg-brand-gold/10 text-heading" : "border-brand-line text-brand-ink/60"
          }`}
        >
          Social media link
        </button>
      </div>

      <div>
        <label className="block text-xs font-medium text-brand-ink/60">Title *</label>
        <input
          required
          value={form.title}
          onChange={(e) => set("title", e.target.value)}
          className="mt-1 w-full rounded-lg border border-brand-line bg-background px-3 py-2 text-sm outline-none focus:border-brand-gold"
        />
      </div>

      {form.kind === "social" ? (
        <>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-medium text-brand-ink/60">Platform</label>
              <select
                value={form.platform}
                onChange={(e) => set("platform", e.target.value as MediaPlatform)}
                className="mt-1 w-full rounded-lg border border-brand-line bg-background px-3 py-2 text-sm outline-none focus:border-brand-gold"
              >
                <option value="instagram">Instagram</option>
                <option value="facebook">Facebook</option>
                <option value="twitter">X / Twitter</option>
                <option value="youtube">YouTube</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-brand-ink/60">Link *</label>
              <input
                required
                type="url"
                value={form.url}
                onChange={(e) => set("url", e.target.value)}
                placeholder="https://instagram.com/p/…"
                className="mt-1 w-full rounded-lg border border-brand-line bg-background px-3 py-2 text-sm outline-none focus:border-brand-gold"
              />
            </div>
          </div>
          <ImageUploadField
            label="Preview photo (optional)"
            value={form.image}
            onChange={(dataUrl) => set("image", dataUrl)}
            shape="wide"
          />
        </>
      ) : (
        <ImageUploadField label="Photo *" value={form.image} onChange={(dataUrl) => set("image", dataUrl)} shape="wide" maxDimension={1400} />
      )}

      <div>
        <label className="block text-xs font-medium text-brand-ink/60">
          {form.kind === "social" ? "Caption (optional)" : "Text"}
        </label>
        <textarea
          value={form.body}
          onChange={(e) => set("body", e.target.value)}
          rows={3}
          className="mt-1 w-full rounded-lg border border-brand-line bg-background px-3 py-2 text-sm outline-none focus:border-brand-gold"
        />
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

export default function AdminMediaPanel({ posts }: { posts: MediaPost[] }) {
  const router = useRouter();
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  async function handleAdd(form: FormState): Promise<string | null> {
    const res = await fetch("/api/admin/media", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formToPayload(form)),
    });
    const data = await res.json();
    if (!res.ok) return data.error ?? "Failed to add post.";
    setAdding(false);
    router.refresh();
    return null;
  }

  async function handleUpdate(id: string, form: FormState): Promise<string | null> {
    const res = await fetch(`/api/admin/media/${id}`, {
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
    if (!window.confirm("Delete this post?")) return;
    setDeletingId(id);
    await fetch(`/api/admin/media/${id}`, { method: "DELETE" });
    router.refresh();
    setDeletingId(null);
  }

  async function handleToggleVisible(p: MediaPost) {
    setBusyId(p.id);
    await fetch(`/api/admin/media/${p.id}`, {
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
        {posts.map((p) => {
          const visible = p.visible !== false;
          return (
            <li
              key={p.id}
              className={`rounded-2xl border border-brand-line bg-surface p-4 ${!visible ? "opacity-55" : ""}`}
            >
              {editingId === p.id ? (
                <MediaForm
                  initial={postToForm(p)}
                  submitLabel="Save changes"
                  onCancel={() => setEditingId(null)}
                  onSubmit={(form) => handleUpdate(p.id, form)}
                />
              ) : (
                <div className="flex items-center gap-4">
                  <div className="relative h-14 w-14 flex-none overflow-hidden rounded-lg bg-brand-paper">
                    {p.image ? (
                      <Image src={p.image} alt={p.title} fill className="object-cover" sizes="56px" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-brand-ink/30">
                        <ExternalLink size={16} />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-heading">{p.title}</p>
                    <p className="truncate text-xs text-brand-ink/55">
                      {p.kind === "social" ? `Social · ${p.platform}` : "Photo post"}
                      {!visible && <span className="ml-1.5 font-semibold text-brand-ink/40">· Hidden</span>}
                    </p>
                  </div>
                  {p.url && (
                    <a
                      href={p.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="Open link"
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
            <p className="text-sm font-semibold text-heading">New post</p>
            <button type="button" onClick={() => setAdding(false)} aria-label="Close">
              <X size={16} className="text-brand-ink/50" />
            </button>
          </div>
          <MediaForm initial={EMPTY_FORM} submitLabel="Publish" onCancel={() => setAdding(false)} onSubmit={handleAdd} />
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setAdding(true)}
          className="mt-4 flex items-center gap-1.5 rounded-full border border-dashed border-brand-line px-4 py-2 text-sm font-medium text-brand-ink/60 hover:border-brand-gold hover:text-heading"
        >
          <Plus size={15} /> Add post
        </button>
      )}
    </div>
  );
}
