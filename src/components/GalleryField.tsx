"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, ImagePlus, Loader2, X } from "lucide-react";
import { resizeAndEncodeImage } from "@/lib/image-client";

const MAX = 10;

async function upload(file: File): Promise<string> {
  const dataUrl = await resizeAndEncodeImage(file, { maxDimension: 1400, quality: 0.74, maxLength: 440_000 });
  const res = await fetch("/api/admin/film-images", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ image: dataUrl }) });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || typeof data.src !== "string") throw new Error(data.error ?? "Upload failed.");
  return data.src;
}

/** "More photos" for a listing: upload several, reorder, remove. They are saved with the property's Save button. */
export default function GalleryField({ value, onChange }: { value: string[]; onChange: (v: string[]) => void }) {
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function add(files: FileList | null) {
    if (!files?.length) return;
    setBusy(true);
    setError("");
    try {
      const added: string[] = [];
      for (const f of Array.from(files).slice(0, MAX - value.length)) added.push(await upload(f));
      onChange([...value, ...added]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed.");
    } finally {
      setBusy(false);
      if (input.current) input.current.value = "";
    }
  }
  const move = (i: number, d: -1 | 1) => {
    const next = [...value];
    [next[i], next[i + d]] = [next[i + d], next[i]];
    onChange(next);
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <label className="block text-xs font-medium text-brand-ink/70">More photos <span className="text-brand-ink/66">(optional, up to {MAX})</span></label>
        <button type="button" disabled={busy || value.length >= MAX} onClick={() => input.current?.click()} className="inline-flex items-center gap-1.5 rounded-full border border-brand-line px-3 py-1 text-xs font-semibold text-heading hover:border-brand-gold disabled:opacity-40">
          {busy ? <Loader2 size={13} className="animate-spin" /> : <ImagePlus size={13} />} Add photos
        </button>
        <input ref={input} type="file" accept="image/*" multiple className="hidden" onChange={(e) => add(e.target.files)} />
      </div>
      {value.length > 0 && (
        <ul className="mt-2 flex gap-2.5 overflow-x-auto pb-1">
          {value.map((src, i) => (
            <li key={src} className="group relative w-24 flex-none">
              <div className="relative aspect-[4/3] overflow-hidden rounded-lg bg-brand-paper ring-1 ring-brand-line">
                <Image src={src} alt="" fill sizes="96px" unoptimized className="object-cover" />
                <button type="button" onClick={() => onChange(value.filter((_, j) => j !== i))} aria-label={`Remove photo ${i + 1}`} className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/65 text-white opacity-0 hover:bg-red-600 focus-visible:opacity-100 group-hover:opacity-100"><X size={11} /></button>
              </div>
              <div className="mt-1 flex items-center justify-between text-brand-ink/66">
                <button type="button" disabled={i === 0} onClick={() => move(i, -1)} aria-label="Move earlier" className="disabled:opacity-25"><ChevronLeft size={14} /></button>
                <span className="text-[10px] tabular-nums">{i + 1}</span>
                <button type="button" disabled={i === value.length - 1} onClick={() => move(i, 1)} aria-label="Move later" className="disabled:opacity-25"><ChevronRight size={14} /></button>
              </div>
            </li>
          ))}
        </ul>
      )}
      {error && <p className="mt-1 text-xs font-medium text-red-600">{error}</p>}
    </div>
  );
}
