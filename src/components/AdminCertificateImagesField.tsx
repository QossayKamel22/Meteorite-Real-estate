"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { ArrowLeft, ArrowRight, ImagePlus, Loader2, Trash2 } from "lucide-react";
import { resizeAndEncodeImage } from "@/lib/image-client";
import { MAX_CERT_IMAGES } from "@/lib/certificate-images";

/**
 * Manages a certificate's images. The list order IS the display order on the
 * website: the first image is shown first (and tagged "Latest"). A newly added
 * image goes to the front, because the newest card should lead; arrows reorder.
 */
export default function AdminCertificateImagesField({
  images,
  onChange,
}: {
  images: string[];
  onChange: (images: string[]) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setError("");
    setLoading(true);
    try {
      const added: string[] = [];
      for (const file of Array.from(files)) {
        if (images.length + added.length >= MAX_CERT_IMAGES) {
          setError(`You can add up to ${MAX_CERT_IMAGES} images.`);
          break;
        }
        // Certificates are served by URL (never inlined in pages), so they can be sharper than a headshot.
        added.push(await resizeAndEncodeImage(file, { maxDimension: 1000, quality: 0.8, maxLength: 220_000 }));
      }
      // Newest first: what you just added leads the list.
      if (added.length > 0) onChange([...added, ...images]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to process image.");
    } finally {
      setLoading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  function move(i: number, delta: number) {
    const j = i + delta;
    if (j < 0 || j >= images.length) return;
    const next = images.slice();
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  }

  return (
    <div>
      <label className="block text-xs font-medium text-brand-ink/60">Certificate images * (newest first)</label>

      <ul className="mt-2 grid gap-3 sm:grid-cols-2">
        {images.map((src, i) => (
          <li key={`${i}-${src.slice(-24)}`} className="rounded-xl border border-brand-line bg-background p-2">
            <div className="relative aspect-[3/2] overflow-hidden rounded-lg bg-brand-paper">
              <Image src={src} alt={`Certificate image ${i + 1}`} fill unoptimized className="object-contain" sizes="240px" />
              <span
                className={`absolute left-2 top-2 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
                  i === 0 ? "bg-brand-gold text-brand-navy" : "bg-brand-navy/80 text-white"
                }`}
              >
                {i === 0 ? "Latest — shown first" : `Earlier ${i}`}
              </span>
            </div>
            <div className="mt-2 flex items-center justify-between">
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => move(i, -1)}
                  disabled={i === 0}
                  aria-label={`Move image ${i + 1} earlier in the list (shown sooner)`}
                  className="flex h-7 w-7 items-center justify-center rounded-full text-brand-ink/50 hover:bg-brand-paper hover:text-heading disabled:opacity-25"
                >
                  <ArrowLeft size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => move(i, 1)}
                  disabled={i === images.length - 1}
                  aria-label={`Move image ${i + 1} later in the list (shown after)`}
                  className="flex h-7 w-7 items-center justify-center rounded-full text-brand-ink/50 hover:bg-brand-paper hover:text-heading disabled:opacity-25"
                >
                  <ArrowRight size={14} />
                </button>
              </div>
              <button
                type="button"
                onClick={() => onChange(images.filter((_, idx) => idx !== i))}
                disabled={images.length <= 1}
                title={images.length <= 1 ? "A certificate needs at least one image" : "Remove this image"}
                aria-label={`Remove image ${i + 1}`}
                className="flex h-7 w-7 items-center justify-center rounded-full text-brand-ink/50 hover:bg-red-50 hover:text-red-600 disabled:opacity-25"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </li>
        ))}

        {images.length < MAX_CERT_IMAGES && (
          <li>
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={loading}
              className="flex aspect-[3/2] w-full flex-col items-center justify-center gap-1.5 rounded-xl border border-dashed border-brand-line text-sm font-medium text-brand-ink/60 transition-colors hover:border-brand-gold hover:text-heading disabled:opacity-60"
            >
              {loading ? <Loader2 size={18} className="animate-spin text-brand-gold" /> : <ImagePlus size={18} />}
              {images.length === 0 ? "Upload image" : "Add another image"}
              <span className="text-[11px] font-normal text-brand-ink/40">Goes first · JPG or PNG</span>
            </button>
          </li>
        )}
      </ul>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
      {error && <p className="mt-1.5 text-xs font-medium text-red-600">{error}</p>}
      <p className="mt-1.5 text-[11px] text-brand-ink/40">
        With more than one image the website shows them as a swipeable carousel, in this order.
      </p>
    </div>
  );
}
