"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Eye, EyeOff, ExternalLink, Pencil, Pin, PinOff, Plus, Trash2, Video, X } from "lucide-react";
import type { MediaPlatform, MediaPost, MediaPostInput } from "@/lib/media-posts-data";
import { MAX_PINNED_POSTS } from "@/lib/media-posts-constants";
import ImageUploadField from "@/components/ImageUploadField";

type FormState = {
  kind: "social" | "post" | "podcast";
  title: string;
  body: string;
  image: string;
  video: string;
  platform: MediaPlatform;
  url: string;
  section: string;
  pinned: boolean;
  visible: boolean;
};

const EMPTY_FORM: FormState = {
  kind: "post",
  title: "",
  body: "",
  image: "",
  video: "",
  platform: "instagram",
  url: "",
  section: "",
  pinned: false,
  visible: true,
};

function postToForm(p: MediaPost): FormState {
  return {
    kind: p.kind,
    title: p.title,
    body: p.body ?? "",
    image: p.image ?? "",
    video: p.video ?? "",
    platform: p.platform ?? "instagram",
    url: p.url ?? "",
    section: p.section ?? "",
    pinned: p.pinned ?? false,
    visible: p.visible !== false,
  };
}

function formToPayload(form: FormState): MediaPostInput {
  if (form.kind === "social" || form.kind === "podcast") {
    return {
      kind: form.kind,
      title: form.title.trim(),
      url: form.url.trim() || undefined,
      platform: form.platform,
      body: form.body.trim() || undefined,
      image: form.image.trim() || undefined,
      video: form.video.trim() || undefined,
      section: form.kind === "podcast" ? form.section.trim() || undefined : undefined,
      pinned: form.pinned,
      visible: form.visible,
    } as MediaPostInput;
  }
  return {
    kind: "post",
    title: form.title.trim(),
    image: form.image.trim() || undefined,
    video: form.video.trim() || undefined,
    body: form.body.trim() || undefined,
    pinned: form.pinned,
    visible: form.visible,
  } as MediaPostInput;
}

function MediaForm({
  initial,
  onCancel,
  onSubmit,
  submitLabel,
  existingSections,
  pinnedCount,
}: {
  initial: FormState;
  onCancel: () => void;
  onSubmit: (form: FormState) => Promise<string | null>;
  submitLabel: string;
  existingSections: string[];
  pinnedCount: number;
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
        <button
          type="button"
          onClick={() => set("kind", "podcast")}
          className={`flex-1 rounded-lg border px-3 py-2 text-sm font-semibold transition-colors ${
            form.kind === "podcast" ? "border-brand-gold bg-brand-gold/10 text-heading" : "border-brand-line text-brand-ink/60"
          }`}
        >
          Podcast embed
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

      {form.kind === "social" || form.kind === "podcast" ? (
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
                {form.kind === "social" && <option value="youtube">YouTube</option>}
                {form.kind === "social" && <option value="other">Other</option>}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-brand-ink/60">
                {form.kind === "podcast" ? "Post permalink" : "Link *"}
              </label>
              <input
                required={form.kind === "social"}
                type="url"
                value={form.url}
                onChange={(e) => set("url", e.target.value)}
                placeholder="https://instagram.com/p/…"
                className="mt-1 w-full rounded-lg border border-brand-line bg-background px-3 py-2 text-sm outline-none focus:border-brand-gold"
              />
              {form.kind === "podcast" && (
                <p className="mt-1 text-xs text-brand-ink/45">
                  Optional if a video link is set below — otherwise it&apos;s embedded inline using the platform&apos;s own widget.
                </p>
              )}
            </div>
          </div>
          {form.kind === "podcast" && (
            <div>
              <label className="block text-xs font-medium text-brand-ink/60">Section</label>
              <input
                list="podcast-sections"
                value={form.section}
                onChange={(e) => set("section", e.target.value)}
                placeholder="Podcasts"
                className="mt-1 w-full rounded-lg border border-brand-line bg-background px-3 py-2 text-sm outline-none focus:border-brand-gold"
              />
              <datalist id="podcast-sections">
                {existingSections.map((s) => (
                  <option key={s} value={s} />
                ))}
              </datalist>
              <p className="mt-1 text-xs text-brand-ink/45">
                Group episodes into their own section (e.g. &quot;Market Talk&quot;) — leave blank for the default &quot;Podcasts&quot; section.
              </p>
            </div>
          )}
          <div>
            <label className="block text-xs font-medium text-brand-ink/60">
              {form.kind === "podcast" ? "Video link (recommended)" : "Video link (optional)"}
            </label>
            <input
              type="url"
              value={form.video}
              onChange={(e) => set("video", e.target.value)}
              placeholder="https://.../clip.mp4 or a YouTube link"
              className="mt-1 w-full rounded-lg border border-brand-line bg-background px-3 py-2 text-sm outline-none focus:border-brand-gold"
            />
            <p className="mt-1 text-xs text-brand-ink/45">
              A direct video file (.mp4/.webm) or YouTube link — plays inline as a real video.
            </p>
          </div>
          <ImageUploadField
            label="Preview photo (optional)"
            value={form.image}
            onChange={(dataUrl) => set("image", dataUrl)}
            shape="wide"
          />
        </>
      ) : (
        <>
          <ImageUploadField label="Photo (optional if a video is added)" value={form.image} onChange={(dataUrl) => set("image", dataUrl)} shape="wide" maxDimension={1000} />
          <div>
            <label className="block text-xs font-medium text-brand-ink/60">Video link (optional)</label>
            <input
              type="url"
              value={form.video}
              onChange={(e) => set("video", e.target.value)}
              placeholder="https://.../clip.mp4 or a YouTube link"
              className="mt-1 w-full rounded-lg border border-brand-line bg-background px-3 py-2 text-sm outline-none focus:border-brand-gold"
            />
          </div>
        </>
      )}

      <div>
        <label className="block text-xs font-medium text-brand-ink/60">
          {form.kind === "post" ? "Text" : "Caption (optional)"}
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

      <label
        className={`flex items-center gap-2 text-sm font-medium ${
          !form.pinned && pinnedCount >= MAX_PINNED_POSTS ? "text-brand-ink/35" : "text-brand-ink/70"
        }`}
      >
        <input
          type="checkbox"
          checked={form.pinned}
          disabled={!form.pinned && pinnedCount >= MAX_PINNED_POSTS}
          onChange={(e) => set("pinned", e.target.checked)}
          className="h-4 w-4 rounded border-brand-line accent-brand-gold"
        />
        Pin to the top ({pinnedCount}/{MAX_PINNED_POSTS} pinned)
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

  async function handleTogglePinned(p: MediaPost): Promise<string | null> {
    setBusyId(p.id);
    const res = await fetch(`/api/admin/media/${p.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pinned: !p.pinned }),
    });
    const data = await res.json();
    router.refresh();
    setBusyId(null);
    return res.ok ? null : (data.error ?? "Failed to pin.");
  }

  const existingSections = Array.from(
    new Set(posts.filter((p) => p.kind === "podcast" && p.section).map((p) => p.section as string))
  );
  const totalPinned = posts.filter((p) => p.pinned).length;

  return (
    <div>
      <ul className="space-y-3">
        {posts.map((p) => {
          const visible = p.visible !== false;
          return (
            <li
              key={p.id}
              className={`rounded-2xl border p-4 ${p.pinned ? "border-brand-gold/50 bg-brand-gold/5" : "border-brand-line bg-surface"} ${!visible ? "opacity-55" : ""}`}
            >
              {editingId === p.id ? (
                <MediaForm
                  initial={postToForm(p)}
                  submitLabel="Save changes"
                  onCancel={() => setEditingId(null)}
                  onSubmit={(form) => handleUpdate(p.id, form)}
                  existingSections={existingSections}
                  pinnedCount={totalPinned - (p.pinned ? 1 : 0)}
                />
              ) : (
                <div className="flex items-center gap-4">
                  <div className="relative h-14 w-14 flex-none overflow-hidden rounded-lg bg-brand-paper">
                    {p.image ? (
                      <Image src={p.image} alt={p.title} fill className="object-cover" sizes="56px" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-brand-ink/30">
                        {p.video ? <Video size={16} /> : <ExternalLink size={16} />}
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-heading">
                      {p.pinned && <Pin size={12} className="mr-1 inline text-brand-gold" />}
                      {p.title}
                    </p>
                    <p className="truncate text-xs text-brand-ink/55">
                      {p.kind === "social" && `Social · ${p.platform}`}
                      {p.kind === "podcast" && `Podcast · ${p.platform}${p.section ? ` · ${p.section}` : ""}`}
                      {p.kind === "post" && "Photo post"}
                      {p.video && " · Video"}
                      {!visible && <span className="ml-1.5 font-semibold text-brand-ink/40">· Hidden</span>}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={async () => {
                      const err = await handleTogglePinned(p);
                      if (err) window.alert(err);
                    }}
                    disabled={busyId === p.id || (!p.pinned && totalPinned >= MAX_PINNED_POSTS)}
                    aria-label={p.pinned ? `Unpin ${p.title}` : `Pin ${p.title}`}
                    title={!p.pinned && totalPinned >= MAX_PINNED_POSTS ? `Only ${MAX_PINNED_POSTS} posts can be pinned` : undefined}
                    className="flex h-8 w-8 flex-none items-center justify-center rounded-full text-brand-ink/50 hover:bg-brand-paper hover:text-heading disabled:opacity-30"
                  >
                    {p.pinned ? <PinOff size={14} /> : <Pin size={14} />}
                  </button>
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
          <MediaForm
            initial={EMPTY_FORM}
            submitLabel="Publish"
            onCancel={() => setAdding(false)}
            onSubmit={handleAdd}
            existingSections={existingSections}
            pinnedCount={totalPinned}
          />
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
