"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ChevronDown, ChevronUp, Eye, EyeOff, Pencil, Plus, Trash2, X } from "lucide-react";
import type { Certificate, CertificateInput } from "@/lib/certificates-data";
import ImageUploadField from "@/components/ImageUploadField";

type FormState = {
  title: string;
  image: string;
  issuer: string;
  licenseNo: string;
  registrationDate: string;
  expiryDate: string;
  activities: string;
  visible: boolean;
};

const EMPTY_FORM: FormState = {
  title: "",
  image: "",
  issuer: "",
  licenseNo: "",
  registrationDate: "",
  expiryDate: "",
  activities: "",
  visible: true,
};

function certToForm(cert: Certificate): FormState {
  return {
    title: cert.title,
    image: cert.image,
    issuer: cert.issuer ?? "",
    licenseNo: cert.licenseNo ?? "",
    registrationDate: cert.registrationDate ?? "",
    expiryDate: cert.expiryDate ?? "",
    activities: cert.activities?.join("\n") ?? "",
    visible: cert.visible !== false,
  };
}

function formToPayload(form: FormState): CertificateInput {
  return {
    title: form.title.trim(),
    image: form.image.trim(),
    issuer: form.issuer.trim() || undefined,
    licenseNo: form.licenseNo.trim() || undefined,
    registrationDate: form.registrationDate.trim() || undefined,
    expiryDate: form.expiryDate.trim() || undefined,
    visible: form.visible,
    activities: form.activities
      .split("\n")
      .map((a) => a.trim())
      .filter(Boolean),
  } as CertificateInput;
}

function CertificateForm({
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

  const [imageError, setImageError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.image) {
      setImageError("Please upload an image.");
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
        label="Certificate image *"
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
          <label className="block text-xs font-medium text-brand-ink/60">Issuer</label>
          <input
            value={form.issuer}
            onChange={(e) => set("issuer", e.target.value)}
            className="mt-1 w-full rounded-lg border border-brand-line bg-background px-3 py-2 text-sm outline-none focus:border-brand-gold"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-brand-ink/60">License No.</label>
          <input
            value={form.licenseNo}
            onChange={(e) => set("licenseNo", e.target.value)}
            className="mt-1 w-full rounded-lg border border-brand-line bg-background px-3 py-2 text-sm outline-none focus:border-brand-gold"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-brand-ink/60">Registration date</label>
          <input
            value={form.registrationDate}
            onChange={(e) => set("registrationDate", e.target.value)}
            placeholder="DD/MM/YYYY"
            className="mt-1 w-full rounded-lg border border-brand-line bg-background px-3 py-2 text-sm outline-none focus:border-brand-gold"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-brand-ink/60">Expiry date</label>
          <input
            value={form.expiryDate}
            onChange={(e) => set("expiryDate", e.target.value)}
            placeholder="DD/MM/YYYY"
            className="mt-1 w-full rounded-lg border border-brand-line bg-background px-3 py-2 text-sm outline-none focus:border-brand-gold"
          />
        </div>
        <div className="sm:col-span-2">
          <label className="block text-xs font-medium text-brand-ink/60">
            Activities (one per line)
          </label>
          <textarea
            value={form.activities}
            onChange={(e) => set("activities", e.target.value)}
            rows={2}
            className="mt-1 w-full rounded-lg border border-brand-line bg-background px-3 py-2 text-sm outline-none focus:border-brand-gold"
          />
        </div>
      </div>

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

export default function AdminCertificatesPanel({ certificates }: { certificates: Certificate[] }) {
  const router = useRouter();
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  async function handleAdd(form: FormState): Promise<string | null> {
    const res = await fetch("/api/admin/certificates", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formToPayload(form)),
    });
    const data = await res.json();
    if (!res.ok) return data.error ?? "Failed to add certificate.";
    setAdding(false);
    router.refresh();
    return null;
  }

  async function handleUpdate(id: string, form: FormState): Promise<string | null> {
    const res = await fetch(`/api/admin/certificates/${id}`, {
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
    await fetch(`/api/admin/certificates/${id}`, { method: "DELETE" });
    router.refresh();
    setDeletingId(null);
  }

  async function handleMove(id: string, direction: "up" | "down") {
    setBusyId(id);
    await fetch(`/api/admin/certificates/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ move: direction }),
    });
    router.refresh();
    setBusyId(null);
  }

  async function handleToggleVisible(cert: Certificate) {
    setBusyId(cert.id);
    await fetch(`/api/admin/certificates/${cert.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ visible: !(cert.visible !== false) }),
    });
    router.refresh();
    setBusyId(null);
  }

  return (
    <div>
      <ul className="space-y-3">
        {certificates.map((cert, i) => {
          const visible = cert.visible !== false;
          return (
          <li
            key={cert.id}
            className={`rounded-2xl border border-brand-line bg-surface p-4 ${!visible ? "opacity-55" : ""}`}
          >
            {editingId === cert.id ? (
              <CertificateForm
                initial={certToForm(cert)}
                submitLabel="Save changes"
                onCancel={() => setEditingId(null)}
                onSubmit={(form) => handleUpdate(cert.id, form)}
              />
            ) : (
              <div className="flex items-center gap-4">
                <div className="flex flex-none flex-col">
                  <button
                    type="button"
                    onClick={() => handleMove(cert.id, "up")}
                    disabled={busyId === cert.id || i === 0}
                    aria-label={`Move ${cert.title} up`}
                    className="flex h-5 w-5 items-center justify-center text-brand-ink/40 hover:text-heading disabled:opacity-20"
                  >
                    <ChevronUp size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleMove(cert.id, "down")}
                    disabled={busyId === cert.id || i === certificates.length - 1}
                    aria-label={`Move ${cert.title} down`}
                    className="flex h-5 w-5 items-center justify-center text-brand-ink/40 hover:text-heading disabled:opacity-20"
                  >
                    <ChevronDown size={14} />
                  </button>
                </div>
                <div className="relative h-12 w-16 flex-none overflow-hidden rounded-lg bg-brand-paper">
                  <Image src={cert.image} alt={cert.title} fill className="object-cover" sizes="64px" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-heading">{cert.title}</p>
                  <p className="truncate text-xs text-brand-ink/55">
                    {cert.licenseNo ? `License #${cert.licenseNo}` : cert.issuer ?? "—"}
                    {!visible && <span className="ml-1.5 font-semibold text-brand-ink/40">· Hidden</span>}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleToggleVisible(cert)}
                  disabled={busyId === cert.id}
                  aria-label={visible ? `Hide ${cert.title}` : `Show ${cert.title}`}
                  title={visible ? "Hide from public site" : "Show on public site"}
                  className="flex h-8 w-8 flex-none items-center justify-center rounded-full text-brand-ink/50 hover:bg-brand-paper hover:text-heading disabled:opacity-50"
                >
                  {visible ? <Eye size={14} /> : <EyeOff size={14} />}
                </button>
                <button
                  type="button"
                  onClick={() => setEditingId(cert.id)}
                  aria-label={`Edit ${cert.title}`}
                  className="flex h-8 w-8 flex-none items-center justify-center rounded-full text-brand-ink/50 hover:bg-brand-paper hover:text-heading"
                >
                  <Pencil size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(cert.id)}
                  disabled={deletingId === cert.id}
                  aria-label={`Delete ${cert.title}`}
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
            <p className="text-sm font-semibold text-heading">New certificate</p>
            <button type="button" onClick={() => setAdding(false)} aria-label="Close">
              <X size={16} className="text-brand-ink/50" />
            </button>
          </div>
          <CertificateForm
            initial={EMPTY_FORM}
            submitLabel="Add certificate"
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
          <Plus size={15} /> Add certificate
        </button>
      )}
    </div>
  );
}
