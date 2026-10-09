"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, ChevronUp, Eye, EyeOff, Pencil, Plus, Trash2, X } from "lucide-react";
import { MAX_PROJECTS, type FeaturedProject } from "@/lib/featured-project-shared";
import AdminFeaturedProjectForm, { EMPTY_PROJECT_FORM, projectToForm } from "@/components/AdminFeaturedProjectForm";

const iconBtn =
  "flex h-8 w-8 flex-none items-center justify-center rounded-full text-brand-ink/50 hover:bg-brand-paper hover:text-heading disabled:opacity-50";

/**
 * The homepage's Featured Projects, managed as a list: add new ones, edit,
 * reorder (the order is the carousel order), hide/show, delete. One visible
 * project shows as a single panel on the site; two or more become a swipeable,
 * auto-advancing carousel.
 */
export default function AdminFeaturedProjectsPanel({ projects }: { projects: FeaturedProject[] }) {
  const router = useRouter();
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState("");

  const visibleCount = projects.filter((p) => p.visible).length;
  const atLimit = projects.length >= MAX_PROJECTS;

  async function call(id: string, init: RequestInit, failure: string) {
    setBusyId(id);
    setError("");
    try {
      const res = await fetch(`/api/admin/featured-projects/${id}`, {
        headers: { "Content-Type": "application/json" },
        ...init,
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? failure);
        return;
      }
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setBusyId(null);
    }
  }

  function handleDelete(p: FeaturedProject) {
    if (!window.confirm(`Delete "${p.name}"? This can't be undone.`)) return;
    void call(p.id, { method: "DELETE" }, "Failed to delete.");
  }

  function saved() {
    setAdding(false);
    setEditingId(null);
    router.refresh();
  }

  return (
    <div>
      <p className="mb-4 text-xs text-brand-ink/50" aria-live="polite">
        {visibleCount === 0
          ? "No project is visible — the section is hidden on the homepage."
          : visibleCount === 1
            ? "One project is visible: it shows as a single panel. Add another to turn it into a swipeable carousel."
            : `${visibleCount} projects are visible: they show as a swipeable carousel that advances by itself, in the order below.`}
      </p>

      <ul className="space-y-3">
        {projects.map((p, i) => (
          <li
            key={p.id}
            className={`rounded-2xl border border-brand-line bg-surface p-4 ${!p.visible ? "opacity-55" : ""}`}
          >
            {editingId === p.id ? (
              <AdminFeaturedProjectForm
                initial={projectToForm(p)}
                projectId={p.id}
                onSaved={saved}
                onCancel={() => setEditingId(null)}
              />
            ) : (
              <div className="flex items-center gap-4">
                <div className="flex flex-none flex-col">
                  <button
                    type="button"
                    onClick={() => call(p.id, { method: "PATCH", body: JSON.stringify({ move: "up" }) }, "Failed to move.")}
                    disabled={busyId === p.id || i === 0}
                    aria-label={`Move ${p.name} earlier`}
                    className="flex h-5 w-5 items-center justify-center text-brand-ink/40 hover:text-heading disabled:opacity-20"
                  >
                    <ChevronUp size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => call(p.id, { method: "PATCH", body: JSON.stringify({ move: "down" }) }, "Failed to move.")}
                    disabled={busyId === p.id || i === projects.length - 1}
                    aria-label={`Move ${p.name} later`}
                    className="flex h-5 w-5 items-center justify-center text-brand-ink/40 hover:text-heading disabled:opacity-20"
                  >
                    <ChevronDown size={14} />
                  </button>
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-heading">
                    {p.name}
                    {p.location && <span className="font-normal text-brand-ink/50"> — {p.location}</span>}
                    {!p.visible && <span className="ml-1.5 font-semibold text-brand-ink/40">· Hidden</span>}
                  </p>
                  <p className="truncate text-xs text-brand-ink/55">
                    {p.facts.length} fact{p.facts.length === 1 ? "" : "s"} · {p.image ? "photo" : "no photo"} · {p.linkUrl}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    call(p.id, { method: "PATCH", body: JSON.stringify({ visible: !p.visible }) }, "Failed to update.")
                  }
                  disabled={busyId === p.id}
                  aria-label={p.visible ? `Hide ${p.name}` : `Show ${p.name}`}
                  title={p.visible ? "Hide from public site" : "Show on public site"}
                  className={iconBtn}
                >
                  {p.visible ? <Eye size={14} /> : <EyeOff size={14} />}
                </button>
                <button type="button" onClick={() => setEditingId(p.id)} aria-label={`Edit ${p.name}`} className={iconBtn}>
                  <Pencil size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(p)}
                  disabled={busyId === p.id}
                  aria-label={`Delete ${p.name}`}
                  className="flex h-8 w-8 flex-none items-center justify-center rounded-full text-brand-ink/50 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            )}
          </li>
        ))}
      </ul>

      {error && <p className="mt-3 text-sm font-medium text-red-600">{error}</p>}

      {adding ? (
        <div className="mt-4 rounded-2xl border border-brand-gold/40 bg-surface p-4">
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm font-semibold text-heading">New featured project</p>
            <button type="button" onClick={() => setAdding(false)} aria-label="Close">
              <X size={16} className="text-brand-ink/50" />
            </button>
          </div>
          <AdminFeaturedProjectForm initial={EMPTY_PROJECT_FORM} onSaved={saved} onCancel={() => setAdding(false)} />
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setAdding(true)}
          disabled={atLimit}
          className="mt-4 flex items-center gap-1.5 rounded-full border border-dashed border-brand-line px-4 py-2 text-sm font-medium text-brand-ink/60 hover:border-brand-gold hover:text-heading disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Plus size={15} /> {atLimit ? `Limit of ${MAX_PROJECTS} projects reached` : "Add project"}
        </button>
      )}
    </div>
  );
}
