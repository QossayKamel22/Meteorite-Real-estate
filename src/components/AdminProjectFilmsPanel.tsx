"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { CheckCircle2, ChevronDown, ChevronUp, Eye, EyeOff, Plus, Trash2, X } from "lucide-react";
import {
  FILM_LIMITS,
  MAX_FILMS,
  MAX_FILM_FACTS,
  getFilmEmbedUrl,
  parseProjectFilms,
  type ProjectFilm,
} from "@/lib/project-film-shared";

const inputClass =
  "mt-1 w-full rounded-lg border border-brand-line bg-background px-3 py-2 text-sm outline-none focus:border-brand-gold";
const labelClass = "block text-xs font-medium text-brand-ink/60";
const iconBtn =
  "flex h-8 w-8 flex-none items-center justify-center rounded-full text-brand-ink/50 hover:bg-brand-paper hover:text-heading disabled:opacity-30";

function newFilm(): ProjectFilm {
  return {
    id: `p${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`,
    visible: true,
    kicker: "Project Film",
    title: "",
    location: "",
    description: "",
    facts: [],
    videoUrl: "",
    poster: "",
    images: [],
  };
}

const clone = (films: ProjectFilm[]): ProjectFilm[] => films.map((f) => ({ ...f, facts: f.facts.map((x) => ({ ...x })), images: f.images.map((x) => ({ ...x })) }));

/**
 * Manages the homepage "Project films": each one is a full-width video with its
 * title, text, key facts and a swipeable image strip. Order here = order on the
 * site. Everything is saved together with one button.
 */
export default function AdminProjectFilmsPanel({ films }: { films: ProjectFilm[] }) {
  const router = useRouter();
  const [saved, setSaved] = useState<ProjectFilm[]>(() => clone(films));
  const [list, setList] = useState<ProjectFilm[]>(() => clone(films));
  const [openId, setOpenId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const dirty = JSON.stringify(list) !== JSON.stringify(saved);
  const patch = (id: string, p: Partial<ProjectFilm>) => setList((l) => l.map((f) => (f.id === id ? { ...f, ...p } : f)));
  const move = (i: number, d: number) =>
    setList((l) => {
      const j = i + d;
      if (j < 0 || j >= l.length) return l;
      const n = l.slice();
      [n[i], n[j]] = [n[j], n[i]];
      return n;
    });

  function add() {
    const f = newFilm();
    setList((l) => [...l, f]);
    setOpenId(f.id);
  }

  function remove(f: ProjectFilm) {
    if (!window.confirm(`Delete "${f.title || "this project"}"? (Takes effect when you press Save.)`)) return;
    setList((l) => l.filter((x) => x.id !== f.id));
  }

  async function save() {
    setError("");
    setDone(false);
    const check = parseProjectFilms({ films: list });
    if (!check.ok) {
      setError(check.error);
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/admin/project-film", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ films: check.value }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "Failed to save.");
        return;
      }
      setSaved(clone(check.value));
      setList(clone(check.value));
      setDone(true);
      router.refresh();
      window.setTimeout(() => setDone(false), 3500);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <ul className="space-y-3">
        {list.map((f, i) => {
          const open = openId === f.id;
          const linkOk = f.videoUrl.trim() === "" || getFilmEmbedUrl(f.videoUrl) !== null;
          return (
            <li key={f.id} className={`rounded-2xl border border-brand-line bg-surface p-4 ${!f.visible ? "opacity-60" : ""}`}>
              <div className="flex items-center gap-3">
                <div className="flex flex-none flex-col">
                  <button type="button" onClick={() => move(i, -1)} disabled={i === 0} aria-label={`Move ${f.title || "project"} up`} className="flex h-5 w-5 items-center justify-center text-brand-ink/40 hover:text-heading disabled:opacity-20">
                    <ChevronUp size={14} />
                  </button>
                  <button type="button" onClick={() => move(i, 1)} disabled={i === list.length - 1} aria-label={`Move ${f.title || "project"} down`} className="flex h-5 w-5 items-center justify-center text-brand-ink/40 hover:text-heading disabled:opacity-20">
                    <ChevronDown size={14} />
                  </button>
                </div>
                <button type="button" onClick={() => setOpenId(open ? null : f.id)} aria-expanded={open} className="min-w-0 flex-1 text-left">
                  <p className="truncate text-sm font-semibold text-heading">
                    {f.title || "New project"}
                    {!f.visible && <span className="ml-1.5 font-semibold text-brand-ink/40">· Hidden</span>}
                  </p>
                  <p className="truncate text-xs text-brand-ink/55">
                    {f.location || "No location"} · {f.images.length} image{f.images.length === 1 ? "" : "s"}
                  </p>
                </button>
                <button type="button" onClick={() => patch(f.id, { visible: !f.visible })} aria-label={f.visible ? `Hide ${f.title}` : `Show ${f.title}`} title={f.visible ? "Hide from public site" : "Show on public site"} className={iconBtn}>
                  {f.visible ? <Eye size={14} /> : <EyeOff size={14} />}
                </button>
                <button type="button" onClick={() => remove(f)} aria-label={`Delete ${f.title || "project"}`} className="flex h-8 w-8 flex-none items-center justify-center rounded-full text-brand-ink/50 hover:bg-red-50 hover:text-red-600">
                  <Trash2 size={14} />
                </button>
              </div>

              {open && (
                <div className="mt-4 space-y-4 border-t border-brand-line pt-4">
                  <div>
                    <label className={labelClass}>Video link (Google Drive, YouTube or Vimeo)</label>
                    <input type="url" value={f.videoUrl} maxLength={FILM_LIMITS.videoUrl} placeholder="https://drive.google.com/file/d/…/view" onChange={(e) => patch(f.id, { videoUrl: e.target.value })} className={`${inputClass} ${linkOk ? "" : "border-red-400"}`} />
                    <p className={`mt-1 text-[11px] ${linkOk ? "text-brand-ink/40" : "font-medium text-red-600"}`}>
                      {linkOk ? "For Drive: share the file as “Anyone with the link can view”. Landscape videos look best." : "That isn't a Google Drive, YouTube or Vimeo link."}
                    </p>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className={labelClass}>Title</label>
                      <input value={f.title} maxLength={FILM_LIMITS.title} onChange={(e) => patch(f.id, { title: e.target.value })} className={inputClass} />
                    </div>
                    <div>
                      <label className={labelClass}>Small label above the title</label>
                      <input value={f.kicker} maxLength={FILM_LIMITS.kicker} onChange={(e) => patch(f.id, { kicker: e.target.value })} className={inputClass} />
                    </div>
                  </div>
                  <div>
                    <label className={labelClass}>Location</label>
                    <input value={f.location} maxLength={FILM_LIMITS.location} onChange={(e) => patch(f.id, { location: e.target.value })} className={inputClass} />
                  </div>
                  <div>
                    <div className="flex items-center justify-between">
                      <label className={labelClass}>Description</label>
                      <span className="text-[11px] text-brand-ink/40">{f.description.length} / {FILM_LIMITS.description}</span>
                    </div>
                    <textarea value={f.description} rows={5} maxLength={FILM_LIMITS.description} onChange={(e) => patch(f.id, { description: e.target.value })} className={`${inputClass} leading-relaxed`} />
                  </div>

                  <div>
                    <div className="flex items-center justify-between">
                      <label className={labelClass}>Key facts (up to {MAX_FILM_FACTS})</label>
                      {f.facts.length < MAX_FILM_FACTS && (
                        <button type="button" onClick={() => patch(f.id, { facts: [...f.facts, { value: "", label: "" }] })} className="inline-flex items-center gap-1 text-xs font-semibold text-brand-gold hover:underline">
                          <Plus size={12} /> Add fact
                        </button>
                      )}
                    </div>
                    <div className="mt-2 space-y-2">
                      {f.facts.map((fact, k) => (
                        <div key={k} className="grid grid-cols-[1fr_1fr_auto] items-center gap-2">
                          <input aria-label={`Fact ${k + 1} figure`} value={fact.value} maxLength={FILM_LIMITS.factValue} placeholder="12" onChange={(e) => patch(f.id, { facts: f.facts.map((x, idx) => (idx === k ? { ...x, value: e.target.value } : x)) })} className={inputClass.replace("mt-1 ", "")} />
                          <input aria-label={`Fact ${k + 1} label`} value={fact.label} maxLength={FILM_LIMITS.factLabel} placeholder="Towers" onChange={(e) => patch(f.id, { facts: f.facts.map((x, idx) => (idx === k ? { ...x, label: e.target.value } : x)) })} className={inputClass.replace("mt-1 ", "")} />
                          <button type="button" aria-label={`Remove fact ${k + 1}`} onClick={() => patch(f.id, { facts: f.facts.filter((_, idx) => idx !== k) })} className="flex h-9 w-9 items-center justify-center rounded-lg text-brand-ink/40 hover:bg-red-500/10 hover:text-red-600">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {f.images.length > 0 && (
                    <div>
                      <label className={labelClass}>Gallery images ({f.images.length}) — remove any you don&apos;t want shown</label>
                      <ul className="mt-2 grid grid-cols-3 gap-2 sm:grid-cols-6">
                        {f.images.map((im) => (
                          <li key={im.src} className="group relative aspect-square overflow-hidden rounded-lg bg-brand-paper ring-1 ring-brand-line">
                            <Image src={im.src} alt={im.alt} fill sizes="120px" className="object-cover" />
                            <button type="button" aria-label={`Remove image: ${im.alt}`} onClick={() => patch(f.id, { images: f.images.filter((x) => x.src !== im.src) })} className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/65 text-white hover:bg-red-600">
                              <X size={12} />
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </li>
          );
        })}
      </ul>

      <button type="button" onClick={add} disabled={list.length >= MAX_FILMS} className="mt-4 flex items-center gap-1.5 rounded-full border border-dashed border-brand-line px-4 py-2 text-sm font-medium text-brand-ink/60 hover:border-brand-gold hover:text-heading disabled:cursor-not-allowed disabled:opacity-40">
        <Plus size={15} /> {list.length >= MAX_FILMS ? `Limit of ${MAX_FILMS} projects reached` : "Add project"}
      </button>

      {error && <p className="mt-4 text-sm font-medium text-red-600">{error}</p>}
      {done && (
        <p className="mt-4 flex items-center gap-2 text-sm font-medium text-emerald-600">
          <CheckCircle2 size={16} /> Saved — the homepage will update within a minute.
        </p>
      )}

      <div className="mt-5 flex items-center gap-3">
        <button type="button" onClick={save} disabled={saving || !dirty} className="rounded-full bg-brand-navy px-6 py-3 text-[15px] font-semibold text-white transition-colors hover:bg-brand-navy-light disabled:cursor-not-allowed disabled:opacity-40 dark:bg-brand-gold dark:text-brand-navy dark:hover:bg-brand-gold-soft">
          {saving ? "Saving…" : "Save changes"}
        </button>
        {dirty && !saving && (
          <button type="button" onClick={() => { setList(clone(saved)); setError(""); }} className="text-sm font-medium text-brand-ink/50 hover:text-heading">
            Discard changes
          </button>
        )}
      </div>
    </div>
  );
}
