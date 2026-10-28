"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { CheckCircle2, ChevronDown, ChevronUp, Eye, EyeOff, ImagePlus, Loader2, Plus, Trash2, X } from "lucide-react";
import { resizeAndEncodeImage } from "@/lib/image-client";
import { FacebookIcon, InstagramIcon, TikTokIcon, YouTubeIcon } from "@/components/SocialIcons";
import {
  MAX_REELS,
  PLATFORM_LABEL,
  REEL_LIMITS,
  parseReelFields,
  parseReelUrl,
  parseSocialAccounts,
  type Reel,
  type ReelPlatform,
  type SocialAccounts,
} from "@/lib/reels-shared";

const inputClass = "mt-1 w-full rounded-lg border border-brand-line bg-background px-3 py-2 text-sm outline-none focus:border-brand-gold";
const labelClass = "block text-xs font-medium text-brand-ink/60";
const iconBtn = "flex h-8 w-8 flex-none items-center justify-center rounded-full text-brand-ink/50 hover:bg-brand-paper hover:text-heading disabled:opacity-30";
const ICONS: Record<ReelPlatform, (p: { size?: number }) => React.ReactElement> = { tiktok: TikTokIcon, instagram: InstagramIcon, youtube: YouTubeIcon, facebook: FacebookIcon };

async function uploadCover(file: File): Promise<string> {
  const dataUrl = await resizeAndEncodeImage(file, { maxDimension: 900, quality: 0.8, maxLength: 300_000 });
  const res = await fetch("/api/admin/film-images", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ image: dataUrl }) });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || typeof data.src !== "string") throw new Error(data.error ?? "Upload failed.");
  return data.src;
}

/**
 * Admin > Reels. Paste the link of a TikTok, Instagram, YouTube or Facebook video
 * and it appears in the homepage reel wall; edit its title, give it a cover, hide,
 * reorder or delete it. The account links (TikTok / YouTube) sit at the top.
 */
export default function AdminReelsPanel({ reels, accounts }: { reels: Reel[]; accounts: SocialAccounts }) {
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");
  const [adding, setAdding] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [titles, setTitles] = useState<Record<string, string>>({});
  const [acc, setAcc] = useState<SocialAccounts>(accounts);
  const [accSaved, setAccSaved] = useState(false);
  const [accError, setAccError] = useState("");
  const [accBusy, setAccBusy] = useState(false);
  const coverInput = useRef<HTMLInputElement>(null);
  const coverTarget = useRef("");

  const detected = url.trim() ? parseReelUrl(url) : null;
  const atLimit = reels.length >= MAX_REELS;

  async function call(id: string, init: RequestInit, failure: string) {
    setBusyId(id);
    setError("");
    try {
      const res = await fetch(`/api/admin/reels/${id}`, { headers: { "Content-Type": "application/json" }, ...init });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? failure);
        return false;
      }
      router.refresh();
      return true;
    } catch {
      setError("Something went wrong. Please try again.");
      return false;
    } finally {
      setBusyId(null);
    }
  }

  async function add(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const check = parseReelFields({ url, title });
    if (!check.ok && !(detected && !detected.ok && detected.resolve)) {
      setError(check.error);
      return;
    }
    setAdding(true);
    try {
      const res = await fetch("/api/admin/reels", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ url, title }) });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "Failed to add.");
        return;
      }
      setUrl("");
      setTitle("");
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setAdding(false);
    }
  }

  async function onCoverFile(files: FileList | null) {
    const id = coverTarget.current;
    if (!id || !files?.[0]) return;
    setBusyId(id);
    setError("");
    try {
      const src = await uploadCover(files[0]);
      await call(id, { method: "PUT", body: JSON.stringify({ cover: src }) }, "Failed to set the cover.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setBusyId(null);
      if (coverInput.current) coverInput.current.value = "";
    }
  }

  async function saveAccounts(e: React.FormEvent) {
    e.preventDefault();
    setAccError("");
    setAccSaved(false);
    const check = parseSocialAccounts(acc);
    if (!check.ok) {
      setAccError(check.error);
      return;
    }
    setAccBusy(true);
    try {
      const res = await fetch("/api/admin/social-accounts", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(check.value) });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setAccError(data.error ?? "Failed to save.");
        return;
      }
      setAccSaved(true);
      router.refresh();
      window.setTimeout(() => setAccSaved(false), 3000);
    } catch {
      setAccError("Something went wrong. Please try again.");
    } finally {
      setAccBusy(false);
    }
  }

  return (
    <div>
      <input ref={coverInput} type="file" accept="image/*" className="hidden" onChange={(e) => onCoverFile(e.target.files)} />

      <form onSubmit={saveAccounts} className="mb-8 rounded-2xl border border-brand-line p-4">
        <p className="text-sm font-semibold text-heading">Your accounts</p>
        <p className="mt-0.5 text-xs text-brand-ink/50">Shown as follow buttons in the reel wall and the footer. Leave one empty to hide it.</p>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <div>
            <label className={labelClass}>TikTok page</label>
            <input type="url" value={acc.tiktok} placeholder="https://www.tiktok.com/@name" onChange={(e) => setAcc((a) => ({ ...a, tiktok: e.target.value }))} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>YouTube channel</label>
            <input type="url" value={acc.youtube} placeholder="https://www.youtube.com/@name" onChange={(e) => setAcc((a) => ({ ...a, youtube: e.target.value }))} className={inputClass} />
          </div>
        </div>
        {accError && <p className="mt-2 text-sm font-medium text-red-600">{accError}</p>}
        <div className="mt-3 flex items-center gap-3">
          <button type="submit" disabled={accBusy || (acc.tiktok === accounts.tiktok && acc.youtube === accounts.youtube)} className="rounded-full bg-brand-navy px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-navy-light disabled:cursor-not-allowed disabled:opacity-40 dark:bg-brand-gold dark:text-brand-navy">
            {accBusy ? "Saving…" : "Save accounts"}
          </button>
          {accSaved && <span className="flex items-center gap-1.5 text-sm font-medium text-emerald-600"><CheckCircle2 size={15} /> Saved</span>}
        </div>
      </form>

      <form onSubmit={add} noValidate className="rounded-2xl border border-brand-gold/40 p-4">
        <p className="text-sm font-semibold text-heading">Add a reel</p>
        <p className="mt-0.5 text-xs text-brand-ink/50">Paste the link of a TikTok, Instagram reel, YouTube video or Short, or Facebook video. Only the link is needed.</p>
        <div className="mt-3 grid gap-3 sm:grid-cols-[2fr_1fr]">
          <div>
            <label className={labelClass}>Video link</label>
            <input type="url" value={url} maxLength={REEL_LIMITS.url} placeholder="https://www.tiktok.com/@…/video/…" onChange={(e) => setUrl(e.target.value)} className={inputClass} />
            <p className={`mt-1 text-[11px] ${url.trim() && detected && !detected.ok && !detected.resolve ? "font-medium text-red-600" : "text-brand-ink/40"}`}>
              {!url.trim()
                ? "TikTok, Instagram, YouTube and Facebook links work."
                : detected?.ok
                  ? `Recognised: ${PLATFORM_LABEL[detected.platform]}`
                  : detected?.resolve
                    ? "Short link — we'll look up the real address for you."
                    : "That isn't a TikTok, Instagram, YouTube or Facebook video link."}
            </p>
          </div>
          <div>
            <label className={labelClass}>Title (optional)</label>
            <input value={title} maxLength={REEL_LIMITS.title} onChange={(e) => setTitle(e.target.value)} className={inputClass} />
          </div>
        </div>
        <button type="submit" disabled={adding || atLimit || !url.trim()} className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-brand-navy px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-navy-light disabled:cursor-not-allowed disabled:opacity-40 dark:bg-brand-gold dark:text-brand-navy">
          {adding ? <Loader2 size={15} className="animate-spin" /> : <Plus size={15} />} {atLimit ? `Limit of ${MAX_REELS} reached` : adding ? "Adding…" : "Add reel"}
        </button>
      </form>

      {error && <p className="mt-4 text-sm font-medium text-red-600">{error}</p>}

      <ul className="mt-6 space-y-3">
        {reels.map((r, i) => {
          const Icon = ICONS[r.platform];
          const busy = busyId === r.id;
          const draft = titles[r.id] ?? r.title;
          return (
            <li key={r.id} className={`rounded-2xl border border-brand-line bg-surface p-3 sm:p-4 ${!r.visible ? "opacity-60" : ""}`}>
              <div className="flex items-center gap-3">
                <div className="flex flex-none flex-col">
                  <button type="button" onClick={() => call(r.id, { method: "PATCH", body: JSON.stringify({ move: "up" }) }, "Failed to move.")} disabled={busy || i === 0} aria-label={`Move reel ${i + 1} earlier`} className="flex h-5 w-5 items-center justify-center text-brand-ink/40 hover:text-heading disabled:opacity-20"><ChevronUp size={14} /></button>
                  <button type="button" onClick={() => call(r.id, { method: "PATCH", body: JSON.stringify({ move: "down" }) }, "Failed to move.")} disabled={busy || i === reels.length - 1} aria-label={`Move reel ${i + 1} later`} className="flex h-5 w-5 items-center justify-center text-brand-ink/40 hover:text-heading disabled:opacity-20"><ChevronDown size={14} /></button>
                </div>
                <div className="relative flex h-16 w-11 flex-none items-center justify-center overflow-hidden rounded-lg bg-brand-paper ring-1 ring-brand-line">
                  {r.cover ? <Image src={r.cover} alt="" fill sizes="44px" className="object-cover" unoptimized /> : <Icon size={22} />}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-brand-ink/60"><Icon size={14} /> {PLATFORM_LABEL[r.platform]}{!r.visible && <span className="text-brand-ink/40">· Hidden</span>}</div>
                  <input
                    aria-label={`Title of reel ${i + 1}`}
                    value={draft}
                    maxLength={REEL_LIMITS.title}
                    placeholder="Title (optional)"
                    onChange={(e) => setTitles((t) => ({ ...t, [r.id]: e.target.value }))}
                    onBlur={() => draft !== r.title && call(r.id, { method: "PUT", body: JSON.stringify({ title: draft }) }, "Failed to save the title.")}
                    className="mt-1 w-full rounded-md border border-transparent bg-transparent px-1 py-0.5 text-sm font-medium text-heading outline-none hover:border-brand-line focus:border-brand-gold"
                  />
                  <a href={r.url} target="_blank" rel="noopener noreferrer" className="block truncate px-1 text-[11px] text-brand-ink/40 hover:text-brand-gold">{r.url}</a>
                </div>
                <button type="button" disabled={busy} onClick={() => { coverTarget.current = r.id; coverInput.current?.click(); }} aria-label={`Set cover for reel ${i + 1}`} title="Upload a cover picture" className={iconBtn}>{busy ? <Loader2 size={14} className="animate-spin" /> : <ImagePlus size={14} />}</button>
                {r.cover && r.cover.startsWith("/api/img/film/") && (
                  <button type="button" disabled={busy} onClick={() => call(r.id, { method: "PUT", body: JSON.stringify({ cover: "" }) }, "Failed to remove the cover.")} aria-label={`Remove cover of reel ${i + 1}`} title="Remove the cover" className={iconBtn}><X size={14} /></button>
                )}
                <button type="button" disabled={busy} onClick={() => call(r.id, { method: "PUT", body: JSON.stringify({ visible: !r.visible }) }, "Failed to update.")} aria-label={r.visible ? `Hide reel ${i + 1}` : `Show reel ${i + 1}`} className={iconBtn}>{r.visible ? <Eye size={14} /> : <EyeOff size={14} />}</button>
                <button type="button" disabled={busy} onClick={() => window.confirm("Delete this reel?") && call(r.id, { method: "DELETE" }, "Failed to delete.")} aria-label={`Delete reel ${i + 1}`} className="flex h-8 w-8 flex-none items-center justify-center rounded-full text-brand-ink/50 hover:bg-red-50 hover:text-red-600 disabled:opacity-30"><Trash2 size={14} /></button>
              </div>
            </li>
          );
        })}
        {reels.length === 0 && <li className="rounded-2xl border border-dashed border-brand-line p-6 text-center text-sm text-brand-ink/50">No reels yet — add the first one above. With none, the section is hidden.</li>}
      </ul>
    </div>
  );
}
