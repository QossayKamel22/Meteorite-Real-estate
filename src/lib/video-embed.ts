/**
 * Classifies a pasted video URL so it can be rendered as an actual playable video.
 * Anything that isn't a recognized YouTube/Vimeo page link is treated as "file" —
 * a direct/CDN video URL doesn't always carry a recognizable .mp4-style extension
 * (signed URLs, query strings, etc.), and the <video> tag plays it fine either way
 * as long as the server serves real video bytes. Since this only ever runs on
 * whatever was pasted into the "Video link" field, defaulting to "file" means a
 * video link always renders as a running video instead of silently rendering nothing.
 */
export function getVideoKind(url: string): "file" | "youtube" | "vimeo" {
  const lower = url.toLowerCase();
  if (/(^|\/\/)(www\.)?(youtube\.com\/watch|youtu\.be\/|youtube\.com\/shorts\/)/.test(lower)) return "youtube";
  if (/(^|\/\/)(www\.)?vimeo\.com\//.test(lower)) return "vimeo";
  return "file";
}

export function getYoutubeEmbedUrl(url: string): string | null {
  try {
    const u = new URL(url);
    let id = "";
    if (u.hostname.includes("youtu.be")) id = u.pathname.slice(1);
    else if (u.pathname.startsWith("/shorts/")) id = u.pathname.replace("/shorts/", "");
    else id = u.searchParams.get("v") ?? "";
    if (!id) return null;
    return `https://www.youtube.com/embed/${id}`;
  } catch {
    return null;
  }
}

export function getVimeoEmbedUrl(url: string): string | null {
  try {
    const u = new URL(url);
    const id = u.pathname.split("/").filter(Boolean).pop();
    if (!id || !/^\d+$/.test(id)) return null;
    return `https://player.vimeo.com/video/${id}`;
  } catch {
    return null;
  }
}
