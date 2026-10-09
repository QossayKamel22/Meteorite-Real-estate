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
  const kind = getVideoKind(url);

  if (kind === "youtube" || kind === "vimeo") {
    const embedUrl = kind === "youtube" ? getYoutubeEmbedUrl(url) : getVimeoEmbedUrl(url);
    if (embedUrl) {
      return (
        <div className="aspect-video w-full overflow-hidden rounded-2xl bg-black">
          <iframe
            src={embedUrl}
            title="Video"
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
