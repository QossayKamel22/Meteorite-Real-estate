"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ChevronDown, ChevronUp, Eye, EyeOff, Pencil, Plus, Trash2, X } from "lucide-react";
import type { Agent, AgentInput } from "@/lib/agents-data";
import ImageUploadField from "@/components/ImageUploadField";

type FormState = {
  name: string;
  title: string;
  photo: string;
  email: string;
  phone: string;
  profileUrl: string;
  bio: string;
  background: string;
  credentials: string;
  visible: boolean;
};

const EMPTY_FORM: FormState = {
  name: "",
  title: "",
  photo: "",
  email: "",
  phone: "",
  profileUrl: "",
  bio: "",
  background: "",
  credentials: "",
  visible: true,
};

function agentToForm(agent: Agent): FormState {
  return {
    name: agent.name,
    title: agent.title,
    photo: agent.photo,
    email: agent.email,
    phone: agent.phone ?? "",
    profileUrl: agent.profileUrl ?? "",
    bio: agent.bio ?? "",
    background: agent.background ?? "",
    credentials: agent.credentials?.join("\n") ?? "",
    visible: agent.visible !== false,
  };
}

function formToPayload(form: FormState): AgentInput {
  return {
    name: form.name.trim(),
    title: form.title.trim(),
    photo: form.photo.trim(),
    email: form.email.trim(),
    phone: form.phone.trim() || undefined,
    profileUrl: form.profileUrl.trim() || undefined,
    bio: form.bio.trim() || undefined,
    background: form.background.trim() || undefined,
    visible: form.visible,
    credentials: form.credentials
      .split("\n")
      .map((c) => c.trim())
      .filter(Boolean),
  } as AgentInput;
}

function AgentForm({
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

  function set<K extends keyof FormState>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  const [photoError, setPhotoError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.photo) {
      setPhotoError("Please upload a photo.");
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
        value={form.photo}
        onChange={(dataUrl) => {
          setPhotoError("");
          set("photo", dataUrl);
        }}
        shape="square"
      />
      {photoError && <p className="text-xs font-medium text-red-600">{photoError}</p>}

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
          <label className="block text-xs font-medium text-brand-ink/60">Title *</label>
          <input
            required
            value={form.title}
            onChange={(e) => set("title", e.target.value)}
            className="mt-1 w-full rounded-lg border border-brand-line bg-background px-3 py-2 text-sm outline-none focus:border-brand-gold"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-brand-ink/60">Email *</label>
          <input
            required
            type="email"
            value={form.email}
            onChange={(e) => set("email", e.target.value)}
            className="mt-1 w-full rounded-lg border border-brand-line bg-background px-3 py-2 text-sm outline-none focus:border-brand-gold"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-brand-ink/60">Phone</label>
          <input
            value={form.phone}
            onChange={(e) => set("phone", e.target.value)}
            className="mt-1 w-full rounded-lg border border-brand-line bg-background px-3 py-2 text-sm outline-none focus:border-brand-gold"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-brand-ink/60">Profile URL</label>
          <input
            value={form.profileUrl}
            onChange={(e) => set("profileUrl", e.target.value)}
            className="mt-1 w-full rounded-lg border border-brand-line bg-background px-3 py-2 text-sm outline-none focus:border-brand-gold"
          />
        </div>
      </div>

      <details className="pt-1">
        <summary className="cursor-pointer text-xs font-medium text-brand-ink/60">
          Leadership bio fields (optional — shown in the Leadership section)
        </summary>
        <div className="mt-3 space-y-3">
          <div>
            <label className="block text-xs font-medium text-brand-ink/60">Bio</label>
            <textarea
              value={form.bio}
              onChange={(e) => set("bio", e.target.value)}
              rows={2}
              className="mt-1 w-full rounded-lg border border-brand-line bg-background px-3 py-2 text-sm outline-none focus:border-brand-gold"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-brand-ink/60">Background</label>
            <textarea
              value={form.background}
              onChange={(e) => set("background", e.target.value)}
              rows={2}
              className="mt-1 w-full rounded-lg border border-brand-line bg-background px-3 py-2 text-sm outline-none focus:border-brand-gold"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-brand-ink/60">
              Credentials (one per line)
            </label>
            <textarea
              value={form.credentials}
              onChange={(e) => set("credentials", e.target.value)}
              rows={3}
              className="mt-1 w-full rounded-lg border border-brand-line bg-background px-3 py-2 text-sm outline-none focus:border-brand-gold"
            />
          </div>
        </div>
      </details>

      <label className="flex items-center gap-2 pt-1 text-sm font-medium text-brand-ink/70">
        <input
          type="checkbox"
          checked={form.visible}
          onChange={(e) => setForm((f) => ({ ...f, visible: e.target.checked }))}
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

export default function AdminAgentsPanel({ agents }: { agents: Agent[] }) {
  const router = useRouter();
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  async function handleAdd(form: FormState): Promise<string | null> {
    const res = await fetch("/api/admin/agents", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formToPayload(form)),
    });
    const data = await res.json();
    if (!res.ok) return data.error ?? "Failed to add agent.";
    setAdding(false);
    router.refresh();
    return null;
  }

  async function handleUpdate(id: string, form: FormState): Promise<string | null> {
    const res = await fetch(`/api/admin/agents/${id}`, {
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
    await fetch(`/api/admin/agents/${id}`, { method: "DELETE" });
    router.refresh();
    setDeletingId(null);
  }

  async function handleMove(id: string, direction: "up" | "down") {
    setBusyId(id);
    await fetch(`/api/admin/agents/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ move: direction }),
    });
    router.refresh();
    setBusyId(null);
  }

  async function handleToggleVisible(agent: Agent) {
    setBusyId(agent.id);
    await fetch(`/api/admin/agents/${agent.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ visible: !(agent.visible !== false) }),
    });
    router.refresh();
    setBusyId(null);
  }

  return (
    <div>
      <ul className="space-y-3">
        {agents.map((agent, i) => {
          const visible = agent.visible !== false;
          return (
          <li
            key={agent.id}
            className={`rounded-2xl border border-brand-line bg-surface p-4 ${!visible ? "opacity-55" : ""}`}
          >
            {editingId === agent.id ? (
              <AgentForm
                initial={agentToForm(agent)}
                submitLabel="Save changes"
                onCancel={() => setEditingId(null)}
                onSubmit={(form) => handleUpdate(agent.id, form)}
              />
            ) : (
              <div className="flex items-center gap-4">
                <div className="flex flex-none flex-col">
                  <button
                    type="button"
                    onClick={() => handleMove(agent.id, "up")}
                    disabled={busyId === agent.id || i === 0}
                    aria-label={`Move ${agent.name} up`}
                    className="flex h-5 w-5 items-center justify-center text-brand-ink/40 hover:text-heading disabled:opacity-20"
                  >
                    <ChevronUp size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleMove(agent.id, "down")}
                    disabled={busyId === agent.id || i === agents.length - 1}
                    aria-label={`Move ${agent.name} down`}
                    className="flex h-5 w-5 items-center justify-center text-brand-ink/40 hover:text-heading disabled:opacity-20"
                  >
                    <ChevronDown size={14} />
                  </button>
                </div>
                <div className="relative h-12 w-12 flex-none overflow-hidden rounded-full bg-brand-paper">
                  <Image src={agent.photo} alt={agent.name} fill className="object-cover" sizes="48px" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-heading">{agent.name}</p>
                  <p className="truncate text-xs text-brand-ink/55">
                    {agent.title} · {agent.email}
                    {!visible && <span className="ml-1.5 font-semibold text-brand-ink/40">· Hidden</span>}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleToggleVisible(agent)}
                  disabled={busyId === agent.id}
                  aria-label={visible ? `Hide ${agent.name}` : `Show ${agent.name}`}
                  title={visible ? "Hide from public site" : "Show on public site"}
                  className="flex h-8 w-8 flex-none items-center justify-center rounded-full text-brand-ink/50 hover:bg-brand-paper hover:text-heading disabled:opacity-50"
                >
                  {visible ? <Eye size={14} /> : <EyeOff size={14} />}
                </button>
                <button
                  type="button"
                  onClick={() => setEditingId(agent.id)}
                  aria-label={`Edit ${agent.name}`}
                  className="flex h-8 w-8 flex-none items-center justify-center rounded-full text-brand-ink/50 hover:bg-brand-paper hover:text-heading"
                >
                  <Pencil size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(agent.id)}
                  disabled={deletingId === agent.id}
                  aria-label={`Delete ${agent.name}`}
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
            <p className="text-sm font-semibold text-heading">New agent</p>
            <button type="button" onClick={() => setAdding(false)} aria-label="Close">
              <X size={16} className="text-brand-ink/50" />
            </button>
          </div>
          <AgentForm
            initial={EMPTY_FORM}
            submitLabel="Add agent"
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
          <Plus size={15} /> Add agent
        </button>
      )}
    </div>
  );
}
