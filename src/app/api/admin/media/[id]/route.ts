import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { hasTrustedOrigin, requireAdmin } from "@/lib/session";
import { updateMediaPost, deleteMediaPost, type MediaPostInput } from "@/lib/media-posts-data";

const PLATFORMS = ["instagram", "facebook", "twitter", "youtube", "other"];

function parseMediaPatch(body: Record<string, unknown>): Partial<MediaPostInput> | string {
  const patch: Partial<MediaPostInput> = {};

  if (typeof body.title === "string") {
    if (!body.title.trim()) return "Title cannot be empty.";
    patch.title = body.title.trim();
  }
  if (typeof body.body === "string") patch.body = body.body.trim() || undefined;
  if (typeof body.image === "string") patch.image = body.image.trim() || undefined;
  if (typeof body.url === "string") {
    if (body.url.trim()) {
      try {
        new URL(body.url.trim());
      } catch {
        return "Please enter a valid link.";
      }
    }
    patch.url = body.url.trim() || undefined;
  }
  if (PLATFORMS.includes(body.platform as string)) {
    patch.platform = body.platform as MediaPostInput["platform"];
  }
  if (typeof body.visible === "boolean") patch.visible = body.visible;

  return patch;
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!hasTrustedOrigin(request)) {
    return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
  }
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { id } = await params;
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const parsed = parseMediaPatch(body);
  if (typeof parsed === "string") {
    return NextResponse.json({ error: parsed }, { status: 400 });
  }

  await updateMediaPost(id, parsed);

  revalidatePath("/media");

  return NextResponse.json({ ok: true });
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!hasTrustedOrigin(request)) {
    return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
  }
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { id } = await params;
  await deleteMediaPost(id);

  revalidatePath("/media");

  return NextResponse.json({ ok: true });
}
