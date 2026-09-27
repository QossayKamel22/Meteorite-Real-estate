import { getVideoKind, getYoutubeEmbedUrl, getVimeoEmbedUrl } from "@/lib/video-embed";

/** Renders a pasted video link as an actual playable video — a direct/CDN file via <video>, or a YouTube/Vimeo page link via its embed. */
export default function MediaVideo({ url, poster }: { url: string; poster?: string }) {
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

  return (
    <video
      controls
      playsInline
      preload="metadata"
      poster={poster}
      className="aspect-video w-full rounded-2xl bg-black object-cover"
      src={url}
    />
  );
}
