"use client";

import { useState } from "react";
import Image from "next/image";
import { isServedImage } from "@/lib/image-url";
import { PlayCircle } from "lucide-react";
import { getVideoKind, getYoutubeEmbedUrl, getVimeoEmbedUrl } from "@/lib/video-embed";

/**
 * Renders a pasted video link as an actual playable video — a direct/CDN
 * file via <video>, or a YouTube/Vimeo page link via its embed. If the
 * direct file fails to actually play (e.g. someone pasted a social-media
 * post page instead of a real video URL, which a <video> tag can't load),
 * this falls back to a clickable "watch" card instead of a silently broken
 * player, so something always visibly works.
 */
export default function MediaVideo({
  url,
  poster,
  fallbackHref,
  fallbackLabel = "Watch episode",
}: {
  url: string;
  poster?: string;
  fallbackHref?: string;
  fallbackLabel?: string;
}) {
  const [fileErrored, setFileErrored] = useState(false);
  const [playing, setPlaying] = useState(false);
  const kind = getVideoKind(url);

  if (kind === "youtube" || kind === "vimeo") {
    const embedUrl = kind === "youtube" ? getYoutubeEmbedUrl(url) : getVimeoEmbedUrl(url);
    if (embedUrl) {
      // YouTube's player is ~700 KB of script per video, so each video is a still picture with a play button
      // until it is tapped; only then is the real player loaded.
      const ytId = kind === "youtube" ? embedUrl.match(/\/embed\/([A-Za-z0-9_-]{6,})/)?.[1] : undefined;
      if (ytId && !playing) {
        return (
          <button type="button" onClick={() => setPlaying(true)} aria-label="Play video" className="group relative block aspect-video w-full overflow-hidden rounded-2xl bg-black">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={poster ? poster : `https://i.ytimg.com/vi/${ytId}/hqdefault.jpg`} alt="" loading="lazy" decoding="async" className="absolute inset-0 h-full w-full object-cover opacity-90 transition-transform duration-700 group-hover:scale-105" />
            <span aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
            <span className="absolute left-1/2 top-1/2 flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-brand-gold text-brand-navy shadow-[0_10px_30px_-8px_rgba(0,0,0,0.6)] transition-transform duration-300 group-hover:scale-110">
              <PlayCircle size={28} strokeWidth={1.75} />
            </span>
          </button>
        );
      }
      return (
        <div className="aspect-video w-full overflow-hidden rounded-2xl bg-black">
          <iframe
            src={ytId ? `${embedUrl}${embedUrl.includes("?") ? "&" : "?"}autoplay=1` : embedUrl}
            title="Video"
            loading="lazy"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="h-full w-full"
          />
        </div>
      );
    }
    // Fell through: e.g. a Vimeo/YouTube homepage link with no video id — still try to play it as a file.
  }

  if (!fileErrored) {
    return (
      <video
        controls
        playsInline
        preload="metadata"
        poster={poster}
        onError={() => setFileErrored(true)}
        className="aspect-video w-full rounded-2xl bg-black object-cover"
        src={url}
      />
    );
  }

  const href = fallbackHref ?? url;
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="group relative flex aspect-video w-full items-center justify-center overflow-hidden rounded-2xl bg-brand-navy"
    >
      {poster && (
        <Image src={poster} alt="" fill sizes="100vw" unoptimized={isServedImage(poster)} className="object-cover opacity-50 blur-sm" />
      )}
      <div className="glow-field" />
      <span className="relative flex flex-col items-center gap-2 text-white">
        <PlayCircle size={40} strokeWidth={1.5} className="transition-transform duration-300 group-hover:scale-110" />
        <span className="text-sm font-semibold">{fallbackLabel}</span>
      </span>
    </a>
  );
}
