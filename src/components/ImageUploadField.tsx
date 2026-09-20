"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { ImagePlus, Loader2 } from "lucide-react";
import { resizeAndEncodeImage } from "@/lib/image-client";

export default function ImageUploadField({
  label,
  value,
  onChange,
  maxDimension = 800,
  shape = "square",
}: {
  label: string;
  value: string;
  onChange: (dataUrl: string) => void;
  maxDimension?: number;
  shape?: "square" | "wide";
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleFile(file: File | undefined) {
    if (!file) return;
    setError("");
    setLoading(true);
    try {
      const dataUrl = await resizeAndEncodeImage(file, { maxDimension });
      onChange(dataUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to process image.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <label className="block text-xs font-medium text-brand-ink/60">{label}</label>
      <div className="mt-1.5 flex items-center gap-3">
        <div
          className={`relative flex-none overflow-hidden border border-brand-line bg-background ${
            shape === "square" ? "h-16 w-16 rounded-full" : "h-16 w-24 rounded-lg"
          }`}
        >
          {value ? (
            <Image src={value} alt="Preview" fill className="object-cover" sizes="96px" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-brand-ink/30">
              <ImagePlus size={20} />
            </div>
          )}
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/70">
              <Loader2 size={16} className="animate-spin text-brand-gold" />
            </div>
          )}
        </div>
        <div>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => handleFile(e.target.files?.[0])}
          />
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={loading}
            className="rounded-full border border-brand-line px-4 py-1.5 text-xs font-semibold text-brand-ink/70 hover:border-brand-gold hover:text-heading disabled:opacity-60"
          >
            {value ? "Change photo" : "Upload photo"}
          </button>
          <p className="mt-1 text-[11px] text-brand-ink/40">JPG or PNG, up to 15MB</p>
        </div>
      </div>
      {error && <p className="mt-1.5 text-xs font-medium text-red-600">{error}</p>}
    </div>
  );
}
