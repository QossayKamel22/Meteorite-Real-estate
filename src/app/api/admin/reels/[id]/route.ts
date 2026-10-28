import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { hasTrustedOrigin, requireAdmin } from "@/lib/session";
import { deleteReel, moveReel, updateReel } from "@/lib/reels-data";
import { REEL_LIMITS, isReelCover } from "@/lib/reels-shared";
import { SAFE_DOC_ID } from "@/lib/image-url";

type Ctx = { params: Promise<{ id: string }> };

async function guard(request: Request, ctx: Ctx): Promise<{ id: string } | NextResponse> {
  if (!hasTrustedOrigin(request)) return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
  if (!(await requireAdmin())) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  const { id } = await ctx.params;
  if (!SAFE_DOC_ID.test(id)) return NextResponse.json({ error: "Not found." }, { status: 404 });
  return { id };
}

const fail = (err: unknown) => {
  console.error("reel write failed", err);
  return NextResponse.json({ error: "Couldn't save right now. Please try again." }, { status: 502 });
};

/** Edit the title / cover / visibility. */
export async function PUT(request: Request, ctx: Ctx) {
  const g = await guard(request, ctx);
  if (g instanceof NextResponse) return g;
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  const patch: Partial<{ title: string; cover: string; visible: boolean }> = {};
  if (body.title !== undefined) {
    const t = typeof body.title === "string" ? body.title.replace(/\s+/g, " ").trim() : null;
    if (t === null || t.length > REEL_LIMITS.title) return NextResponse.json({ error: `The title must be ${REEL_LIMITS.title} characters or fewer.` }, { status: 400 });
    patch.title = t;
  }
  if (body.cover !== undefined) {
    const c = typeof body.cover === "string" ? body.cover.trim() : null;
    if (c === null || (c && (c.length > REEL_LIMITS.cover || !isReelCover(c)))) return NextResponse.json({ error: "The cover must be an uploaded image or an https link." }, { status: 400 });
    patch.cover = c;
  }
  if (body.visible !== undefined) {
    if (typeof body.visible !== "boolean") return NextResponse.json({ error: "Visibility must be on or off." }, { status: 400 });
    patch.visible = body.visible;
  }
  if (Object.keys(patch).length === 0) return NextResponse.json({ error: "Nothing to update." }, { status: 400 });
  try {
    await updateReel(g.id, patch);
  } catch (err) {
    return fail(err);
  }
  revalidatePath("/");
  return NextResponse.json({ ok: true });
}

export async function PATCH(request: Request, ctx: Ctx) {
  const g = await guard(request, ctx);
  if (g instanceof NextResponse) return g;
  let body: { move?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  if (body.move !== "up" && body.move !== "down") return NextResponse.json({ error: "move must be 'up' or 'down'." }, { status: 400 });
  try {
    await moveReel(g.id, body.move);
  } catch (err) {
    return fail(err);
  }
  revalidatePath("/");
  return NextResponse.json({ ok: true });
}

export async function DELETE(request: Request, ctx: Ctx) {
  const g = await guard(request, ctx);
  if (g instanceof NextResponse) return g;
  try {
    await deleteReel(g.id);
  } catch (err) {
    return fail(err);
  }
  revalidatePath("/");
  return NextResponse.json({ ok: true });
}
