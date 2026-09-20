import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { hasTrustedOrigin, requireAdmin } from "@/lib/session";
import { getMediaPosts, addMediaPost, type MediaPostInput } from "@/lib/media-posts-data";

const PLATFORMS = ["instagram", "facebook", "twitter", "youtube", "other"];

function parseMediaInput(body: Record<string, unknown>): MediaPostInput | string {
  const title = typeof body.title === "string" ? body.title.trim() : "";
  const kind = body.kind === "social" || body.kind === "post" ? body.kind : undefined;

  if (!title) return "Title is required.";
  if (!kind) return "kind must be 'social' or 'post'.";

  const body_ = typeof body.body === "string" && body.body.trim() ? body.body.trim() : undefined;
  const image = typeof body.image === "string" && body.image.trim() ? body.image.trim() : undefined;
  const visible = typeof body.visible === "boolean" ? body.visible : true;

  if (kind === "social") {
    const url = typeof body.url === "string" ? body.url.trim() : "";
    if (!url) return "A link is required for a social post.";
    try {
      new URL(url);
    } catch {
      return "Please enter a valid link.";
    }
    const platform = PLATFORMS.includes(body.platform as string) ? (body.platform as MediaPostInput["platform"]) : "other";
    return { kind, title, url, platform, ...(body_ ? { body: body_ } : {}), ...(image ? { image } : {}), visible };
  }

  if (!image) return "A photo is required for a post.";
  return { kind, title, image, ...(body_ ? { body: body_ } : {}), visible };
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

  const id = await addMediaPost(parsed);

  revalidatePath("/media");

  return NextResponse.json({ ok: true, id });
}
