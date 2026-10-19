"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ArrowLeft, ArrowRight, CheckCircle2, ChevronDown, ChevronUp, Eye, EyeOff, ImagePlus, Loader2, Plus, Trash2, X } from "lucide-react";
import { resizeAndEncodeImage } from "@/lib/image-client";
import {
  FILM_LIMITS,
  HEADING_LIMITS,
  MAX_FILMS,
  MAX_FILM_FACTS,
  MAX_FILM_IMAGES,
  getFilmVideo,
  parseProjectFilms,
  type ProjectFilm,
  type ProjectFilmsConfig,
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
    shape: "landscape",
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

const clone = (c: ProjectFilmsConfig): ProjectFilmsConfig => ({
  ...c,
  films: c.films.map((f) => ({ ...f, facts: f.facts.map((x) => ({ ...x })), images: f.images.map((x) => ({ ...x })) })),
});

/** Resizes a picked file in the browser, stores it on the server, and returns the URL the site serves it from plus its shape. */
async function uploadImage(file: File): Promise<{ src: string; ratio: number }> {
  const dataUrl = await resizeAndEncodeImage(file, { maxDimension: 1400, quality: 0.8, maxLength: 420_000 });
  const ratio = await new Promise<number>((resolve) => {
    const img = new window.Image();
    img.onload = () => resolve(img.naturalWidth && img.naturalHeight ? img.naturalWidth / img.naturalHeight : 1);
    img.onerror = () => resolve(1);
    img.src = dataUrl;
  });
  const res = await fetch("/api/admin/film-images", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ image: dataUrl }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || typeof data.src !== "string") throw new Error(data.error ?? "Upload failed.");
  return { src: data.src, ratio: Math.round(ratio * 1000) / 1000 };
}

/**
 * Manages the homepage "Featured Developments": the shared heading, and each
 * project's video, shape, text, key facts, poster and image gallery. Only a
 * project's title is required — everything else can be left empty. Order here
 * is the order on the site. One Save button saves it all.
 */
export default function AdminProjectFilmsPanel({ config }: { config: ProjectFilmsConfig }) {
  const router = useRouter();
  const [saved, setSaved] = useState<ProjectFilmsConfig>(() => clone(config));
  const [draft, setDraft] = useState<ProjectFilmsConfig>(() => clone(config));
  const [openId, setOpenId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const galleryInput = useRef<HTMLInputElement>(null);
  const posterInput = useRef<HTMLInputElement>(null);
  const targetId = useRef<string>("");

  const list = draft.films;
  const dirty = JSON.stringify(draft) !== JSON.stringify(saved);
  const patch = (id: string, p: Partial<ProjectFilm>) =>
    setDraft((d) => ({ ...d, films: d.films.map((f) => (f.id === id ? { ...f, ...p } : f)) }));
  const move = (i: number, dir: number) =>
    setDraft((d) => {
      const j = i + dir;
      if (j < 0 || j >= d.films.length) return d;
      const n = d.films.slice();
      [n[i], n[j]] = [n[j], n[i]];
      return { ...d, films: n };
    });
  const moveImage = (film: ProjectFilm, i: number, dir: number) => {
    const j = i + dir;
    if (j < 0 || j >= film.images.length) return;
    const n = film.images.slice();
    [n[i], n[j]] = [n[j], n[i]];
    patch(film.id, { images: n });
  };

  function add() {
    const f = newFilm();
    setDraft((d) => ({ ...d, films: [...d.films, f] }));
    setOpenId(f.id);
  }

  function remove(f: ProjectFilm) {
    if (!window.confirm(`Delete "${f.title || "this project"}"? (Takes effect when you press Save.)`)) return;
    setDraft((d) => ({ ...d, films: d.films.filter((x) => x.id !== f.id) }));
  }

  async function onGalleryFiles(files: FileList | null) {
    const film = list.find((f) => f.id === targetId.current);
    if (!film || !files || files.length === 0) return;
    setError("");
    setUploading(film.id);
    try {
      const added = [];
      for (const file of Array.from(files)) {
        if (film.images.length + added.length >= MAX_FILM_IMAGES) {
          setError(`A project can show up to ${MAX_FILM_IMAGES} gallery images.`);
          break;
        }
        const up = await uploadImage(file);
        added.push({ src: up.src, ratio: up.ratio, alt: file.name.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " ").slice(0, FILM_LIMITS.alt) });
      }
      if (added.length) patch(film.id, { images: [...film.images, ...added] });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed.");
    } finally {
      setUploading(null);
      if (galleryInput.current) galleryInput.current.value = "";
    }
  }

  async function onPosterFile(files: FileList | null) {
    const id = targetId.current;
    if (!id || !files?.[0]) return;
    setError("");
    setUploading(id);
    try {
      const up = await uploadImage(files[0]);
      patch(id, { poster: up.src });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed.");
    } finally {
      setUploading(null);
      if (posterInput.current) posterInput.current.value = "";
    }
  }

  async function save() {
    setError("");
    setDone(false);
    const check = parseProjectFilms(draft);
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
      setSaved(clone(check.value));
      setDraft(clone(check.value));
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
      <input ref={galleryInput} type="file" accept="image/*" multiple className="hidden" onChange={(e) => onGalleryFiles(e.target.files)} />
      <input ref={posterInput} type="file" accept="image/*" className="hidden" onChange={(e) => onPosterFile(e.target.files)} />

      <div className="mb-5 grid gap-4 rounded-2xl border border-brand-line p-4 sm:grid-cols-2">
        <div>
          <label className={labelClass}>Section heading</label>
          <input value={draft.heading} maxLength={HEADING_LIMITS.heading} onChange={(e) => setDraft((d) => ({ ...d, heading: e.target.value }))} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Short intro under the heading</label>
          <input value={draft.intro} maxLength={HEADING_LIMITS.intro} onChange={(e) => setDraft((d) => ({ ...d, intro: e.target.value }))} className={inputClass} />
        </div>
      </div>

      <ul className="space-y-3">
        {list.map((f, i) => {
          const open = openId === f.id;
          const linkOk = f.videoUrl.trim() === "" || getFilmVideo(f.videoUrl) !== null;
          const busy = uploading === f.id;
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
                    {f.shape === "portrait" ? "Portrait video" : "Landscape video"} · {f.images.length} image{f.images.length === 1 ? "" : "s"}
                  </p>
                </button>
                <button type="button" onClick={() => patch(f.id, { visible: !f.visible })} aria-label={f.visible ? `Hide ${f.title || "project"}` : `Show ${f.title || "project"}`} title={f.visible ? "Hide from public site" : "Show on public site"} className={iconBtn}>
                  {f.visible ? <Eye size={14} /> : <EyeOff size={14} />}
                </button>
                <button type="button" onClick={() => remove(f)} aria-label={`Delete ${f.title || "project"}`} className="flex h-8 w-8 flex-none items-center justify-center rounded-full text-brand-ink/50 hover:bg-red-50 hover:text-red-600">
                  <Trash2 size={14} />
                </button>
              </div>

              {open && (
                <div className="mt-4 space-y-4 border-t border-brand-line pt-4">
                  <div>
                    <label className={labelClass}>Project name * (the only required field)</label>
                    <input value={f.title} maxLength={FILM_LIMITS.title} onChange={(e) => patch(f.id, { title: e.target.value })} className={inputClass} />
                  </div>

                  <div className="grid gap-4 sm:grid-cols-[1fr_auto]">
                    <div>
                      <label className={labelClass}>Video link (optional) — Google Drive, YouTube, Vimeo or an .mp4 link</label>
                      <input type="url" value={f.videoUrl} maxLength={FILM_LIMITS.videoUrl} placeholder="https://drive.google.com/file/d/…/view" onChange={(e) => patch(f.id, { videoUrl: e.target.value })} className={`${inputClass} ${linkOk ? "" : "border-red-400"}`} />
                      <p className={`mt-1 text-[11px] ${linkOk ? "text-brand-ink/40" : "font-medium text-red-600"}`}>
                        {linkOk ? "It starts by itself, muted and looping, with no buttons to Drive. For Drive: share the file as “Anyone with the link can view”." : "That isn't a Google Drive, YouTube, Vimeo or .mp4 link."}
                      </p>
                    </div>
                    <div>
                      <label className={labelClass}>Video shape</label>
                      <select value={f.shape} onChange={(e) => patch(f.id, { shape: e.target.value === "portrait" ? "portrait" : "landscape" })} className={inputClass}>
                        <option value="landscape">Landscape (wide)</option>
                        <option value="portrait">Portrait (tall)</option>
                      </select>
                      <p className="mt-1 text-[11px] text-brand-ink/40">Sets the layout on the site.</p>
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className={labelClass}>Small label above the title</label>
                      <input value={f.kicker} maxLength={FILM_LIMITS.kicker} onChange={(e) => patch(f.id, { kicker: e.target.value })} className={inputClass} />
                    </div>
                    <div>
                      <label className={labelClass}>Location</label>
                      <input value={f.location} maxLength={FILM_LIMITS.location} onChange={(e) => patch(f.id, { location: e.target.value })} className={inputClass} />
                    </div>
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

                  <div>
                    <label className={labelClass}>Poster picture (optional — shown while the video loads; defaults to the first gallery image)</label>
                    <div className="mt-2 flex items-center gap-3">
                      <div className="relative h-14 w-24 flex-none overflow-hidden rounded-lg bg-brand-paper ring-1 ring-brand-line">
                        {f.poster ? <Image src={f.poster} alt="Poster" fill sizes="96px" className="object-cover" /> : <ImagePlus size={18} className="absolute inset-0 m-auto text-brand-ink/30" />}
                      </div>
                      <button type="button" disabled={busy} onClick={() => { targetId.current = f.id; posterInput.current?.click(); }} className="rounded-full border border-brand-line px-4 py-1.5 text-xs font-semibold text-brand-ink/70 hover:border-brand-gold hover:text-heading disabled:opacity-60">
                        {busy ? "Uploading…" : f.poster ? "Change poster" : "Upload poster"}
                      </button>
                      {f.poster && (
                        <button type="button" onClick={() => patch(f.id, { poster: "" })} className="text-xs font-medium text-red-600 hover:underline">Remove</button>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className={labelClass}>Gallery images ({f.images.length} / {MAX_FILM_IMAGES}) — the order here is the order on the site</label>
                    <ul className="mt-2 grid grid-cols-3 gap-2 sm:grid-cols-6">
                      {f.images.map((im, k) => (
                        <li key={im.src} className="rounded-lg ring-1 ring-brand-line">
                          <div className="relative aspect-square overflow-hidden rounded-t-lg bg-brand-paper">
                            <Image src={im.src} alt={im.alt} fill sizes="120px" className="object-cover" />
                          </div>
                          <div className="flex items-center justify-between px-1 py-1">
                            <button type="button" onClick={() => moveImage(f, k, -1)} disabled={k === 0} aria-label={`Move image ${k + 1} earlier`} className="flex h-6 w-6 items-center justify-center rounded text-brand-ink/50 hover:text-heading disabled:opacity-25"><ArrowLeft size={12} /></button>
                            <button type="button" onClick={() => patch(f.id, { images: f.images.filter((_, idx) => idx !== k) })} aria-label={`Remove image: ${im.alt || k + 1}`} className="flex h-6 w-6 items-center justify-center rounded text-brand-ink/50 hover:text-red-600"><X size={12} /></button>
                            <button type="button" onClick={() => moveImage(f, k, 1)} disabled={k === f.images.length - 1} aria-label={`Move image ${k + 1} later`} className="flex h-6 w-6 items-center justify-center rounded text-brand-ink/50 hover:text-heading disabled:opacity-25"><ArrowRight size={12} /></button>
                          </div>
                        </li>
                      ))}
                      {f.images.length < MAX_FILM_IMAGES && (
                        <li>
                          <button type="button" disabled={busy} onClick={() => { targetId.current = f.id; galleryInput.current?.click(); }} className="flex aspect-square w-full flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-brand-line text-[11px] font-medium text-brand-ink/60 hover:border-brand-gold hover:text-heading disabled:opacity-60">
                            {busy ? <Loader2 size={16} className="animate-spin text-brand-gold" /> : <ImagePlus size={16} />}
                            {busy ? "Uploading…" : "Add images"}
                          </button>
                        </li>
                      )}
                    </ul>
                  </div>
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
        <button type="button" onClick={save} disabled={saving || !dirty || uploading !== null} className="rounded-full bg-brand-navy px-6 py-3 text-[15px] font-semibold text-white transition-colors hover:bg-brand-navy-light disabled:cursor-not-allowed disabled:opacity-40 dark:bg-brand-gold dark:text-brand-navy dark:hover:bg-brand-gold-soft">
          {saving ? "Saving…" : "Save changes"}
        </button>
        {dirty && !saving && (
          <button type="button" onClick={() => { setDraft(clone(saved)); setError(""); }} className="text-sm font-medium text-brand-ink/50 hover:text-heading">
            Discard changes
          </button>
        )}
      </div>
    </div>
  );
}
