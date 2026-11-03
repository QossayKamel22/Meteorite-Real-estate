"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ChevronLeft, ChevronRight, ImagePlus, Loader2, X } from "lucide-react";
import { resizeAndEncodeImage } from "@/lib/image-client";
import { MAX_POSTERS, type Poster } from "@/lib/poster-series-shared";

async function uploadPoster(file: File, maxDimension: number): Promise<string> {
  const dataUrl = await resizeAndEncodeImage(file, { maxDimension, quality: 0.72, maxLength: 440_000 });
  const res = await fetch("/api/admin/film-images", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ image: dataUrl }) });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || typeof data.src !== "string") throw new Error(data.error ?? "Upload failed.");
  return data.src;
}

/**
 * Admin > Media: the poster series shown on the Media page. A compact strip of the posters
 * with add (upload), move and remove; every change is saved straight away.
 */
export default function AdminPosterSeriesPanel({
  posters,
  endpoint = "/api/admin/poster-series",
  title = "Poster series",
  hint = `The fanned posters on the Media page. Upload tall (9:16) pictures; up to ${MAX_POSTERS}.`,
  addLabel = "Add posters",
  max = MAX_POSTERS,
  wide = false,
  maxDimension = 1280,
  emptyNote = "No posters yet. With none, the section is hidden on the Media page.",
}: {
  posters: Poster[];
  endpoint?: string;
  title?: string;
  hint?: string;
  addLabel?: string;
  max?: number;
  /** Landscape thumbnails (16:9) instead of tall ones. */
  wide?: boolean;
  maxDimension?: number;
  emptyNote?: string;
}) {
  const router = useRouter();
  const input = useRef<HTMLInputElement>(null);
  const [items, setItems] = useState(posters);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function save(next: Poster[]) {
    setBusy(true);
    setError("");
    try {
      const res = await fetch(endpoint, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ items: next }) });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "Couldn't save.");
        return false;
      }
      setItems(next);
      router.refresh();
      return true;
    } catch {
      setError("Something went wrong. Please try again.");
      return false;
    } finally {
      setBusy(false);
    }
  }

  async function onFiles(files: FileList | null) {
    if (!files?.length) return;
    setBusy(true);
    setError("");
    try {
      const added: Poster[] = [];
      for (const f of Array.from(files).slice(0, max - items.length)) {
        added.push({ src: await uploadPoster(f, maxDimension), alt: wide ? "Dubai" : "Meteorite Real Estate poster" });
      }
      if (added.length) await save([...items, ...added]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed.");
      setBusy(false);
    } finally {
      if (input.current) input.current.value = "";
    }
  }

  const move = (i: number, d: -1 | 1) => {
    const next = [...items];
    [next[i], next[i + d]] = [next[i + d], next[i]];
    void save(next);
  };

  return (
    <div className="glass shimmer-border rounded-3xl p-5 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-heading">{title}</h2>
          <p className="text-xs text-brand-ink/66">{hint}</p>
        </div>
        <button
          type="button"
          disabled={busy || items.length >= max}
          onClick={() => input.current?.click()}
          className="inline-flex items-center gap-1.5 rounded-full bg-brand-navy px-4 py-2 text-sm font-semibold text-white hover:bg-brand-navy-light disabled:cursor-not-allowed disabled:opacity-40 dark:bg-brand-gold dark:text-brand-navy"
        >
          {busy ? <Loader2 size={15} className="animate-spin" /> : <ImagePlus size={15} />} {addLabel}
        </button>
        <input ref={input} type="file" accept="image/*" multiple className="hidden" onChange={(e) => onFiles(e.target.files)} />
      </div>

      {items.length === 0 ? (
        <p className="mt-4 rounded-2xl border border-dashed border-brand-line p-4 text-center text-sm text-brand-ink/50">{emptyNote}</p>
      ) : (
        <ul className="mt-4 flex gap-3 overflow-x-auto pb-1">
          {items.map((p, i) => (
            <li key={p.src} className={`group relative flex-none ${wide ? "w-36" : "w-20"}`}>
              <div className={`relative overflow-hidden ${wide ? "aspect-video" : "aspect-[9/16]"} rounded-lg bg-brand-paper ring-1 ring-brand-line`}>
                <Image src={p.src} alt={p.alt} fill sizes="144px" unoptimized className="object-cover" />
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => window.confirm("Remove this poster?") && save(items.filter((_, j) => j !== i))}
                  aria-label={`Remove poster ${i + 1}`}
                  className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/65 text-white opacity-0 transition-opacity hover:bg-red-600 focus-visible:opacity-100 group-hover:opacity-100 disabled:opacity-30"
                >
                  <X size={13} />
                </button>
              </div>
              <div className="mt-1.5 flex items-center justify-between text-brand-ink/50">
                <button type="button" disabled={busy || i === 0} onClick={() => move(i, -1)} aria-label={`Move poster ${i + 1} earlier`} className="flex h-6 w-6 items-center justify-center rounded-full hover:bg-brand-paper hover:text-heading disabled:opacity-25"><ChevronLeft size={14} /></button>
                <span className="text-[11px] tabular-nums">{i + 1}</span>
                <button type="button" disabled={busy || i === items.length - 1} onClick={() => move(i, 1)} aria-label={`Move poster ${i + 1} later`} className="flex h-6 w-6 items-center justify-center rounded-full hover:bg-brand-paper hover:text-heading disabled:opacity-25"><ChevronRight size={14} /></button>
              </div>
            </li>
          ))}
        </ul>
      )}
      {error && <p className="mt-3 text-sm font-medium text-red-600">{error}</p>}
    </div>
  );
}
