import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { hasTrustedOrigin, requireAdmin } from "@/lib/session";
import {
  getMediaPosts,
  addMediaPost,
  countPinnedPosts,
  MAX_PINNED_POSTS,
  type MediaPostInput,
} from "@/lib/media-posts-data";

const PLATFORMS = ["instagram", "facebook", "twitter", "youtube", "other"];

const INVALID_VIDEO = Symbol("invalid-video");

function parseVideo(body: Record<string, unknown>): string | undefined | typeof INVALID_VIDEO {
  const video = typeof body.video === "string" && body.video.trim() ? body.video.trim() : undefined;
  if (!video) return undefined;
  try {
    new URL(video);
  } catch {
    return INVALID_VIDEO;
  }
  return video;
}

function parseMediaInput(body: Record<string, unknown>): MediaPostInput | string {
  const title = typeof body.title === "string" ? body.title.trim() : "";
  const kind = body.kind === "social" || body.kind === "post" || body.kind === "podcast" ? body.kind : undefined;

  if (!title) return "Title is required.";
  if (!kind) return "kind must be 'social', 'podcast', or 'post'.";

  const body_ = typeof body.body === "string" && body.body.trim() ? body.body.trim() : undefined;
  const image = typeof body.image === "string" && body.image.trim() ? body.image.trim() : undefined;
  const visible = typeof body.visible === "boolean" ? body.visible : true;
  const pinned = typeof body.pinned === "boolean" ? body.pinned : undefined;

  const video = parseVideo(body);
  if (video === INVALID_VIDEO) return "Please enter a valid video link.";
  const videoField = video;

  if (kind === "social" || kind === "podcast") {
    const url = typeof body.url === "string" ? body.url.trim() : "";
    if (!url && !videoField) {
      return kind === "podcast"
        ? "Add a video link or a post permalink for the podcast embed."
        : "A link is required for a social post.";
    }
    if (url) {
      try {
        new URL(url);
      } catch {
        return "Please enter a valid link.";
      }
    }
    const platform = PLATFORMS.includes(body.platform as string) ? (body.platform as MediaPostInput["platform"]) : "other";
    const section = kind === "podcast" && typeof body.section === "string" && body.section.trim() ? body.section.trim() : undefined;
    return {
      kind,
      title,
      ...(url ? { url } : {}),
      platform,
      ...(body_ ? { body: body_ } : {}),
      ...(image ? { image } : {}),
      ...(videoField ? { video: videoField } : {}),
      ...(section ? { section } : {}),
      ...(pinned !== undefined ? { pinned } : {}),
      visible,
    };
  }

  if (!image && !videoField) return "A photo or video is required for a post.";
  return {
    kind,
    title,
    ...(image ? { image } : {}),
    ...(videoField ? { video: videoField } : {}),
    ...(body_ ? { body: body_ } : {}),
    ...(pinned !== undefined ? { pinned } : {}),
    visible,
  };
}

export async function GET() {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }
  return NextResponse.json(await getMediaPosts({ includeHidden: true }));
}

export async function POST(request: Request) {
  if (!hasTrustedOrigin(request)) {
    return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
  }
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const parsed = parseMediaInput(body);
  if (typeof parsed === "string") {
    return NextResponse.json({ error: parsed }, { status: 400 });
  }

  if (parsed.pinned) {
    const pinnedCount = await countPinnedPosts();
    if (pinnedCount >= MAX_PINNED_POSTS) {
      return NextResponse.json(
        { error: `You can only pin up to ${MAX_PINNED_POSTS} posts. Unpin another post first.` },
        { status: 400 }
      );
    }
  }

  const id = await addMediaPost(parsed);

  revalidatePath("/media");

  return NextResponse.json({ ok: true, id });
}
