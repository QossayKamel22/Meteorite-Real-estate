import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { hasTrustedOrigin, requireAdmin } from "@/lib/session";
import {
  deleteFeaturedProject,
  moveFeaturedProject,
  updateFeaturedProject,
} from "@/lib/featured-projects-data";
import { parseFeaturedProject } from "@/lib/featured-project-shared";
import { SAFE_DOC_ID } from "@/lib/image-url";

type Ctx = { params: Promise<{ id: string }> };

/** Shared gate: same-origin, signed-in admin, and a well-formed id. */
async function guard(request: Request, ctx: Ctx): Promise<{ id: string } | NextResponse> {
  if (!hasTrustedOrigin(request)) {
    return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
  }
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }
  const { id } = await ctx.params;
  if (!SAFE_DOC_ID.test(id)) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }
  return { id };
}

async function readJson(request: Request): Promise<unknown | null> {
  try {
    return await request.json();
  } catch {
    return null;
  }
}

function saveFailed(err: unknown): NextResponse {
  console.error("featured project write failed", err);
  return NextResponse.json({ error: "Couldn't save right now. Please try again." }, { status: 502 });
}

/** Full edit from the project form. */
export async function PUT(request: Request, ctx: Ctx) {
  const g = await guard(request, ctx);
  if (g instanceof NextResponse) return g;

  const parsed = parseFeaturedProject(await readJson(request));
  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }
  try {
    await updateFeaturedProject(g.id, parsed.value);
  } catch (err) {
    return saveFailed(err);
  }
  revalidatePath("/");
  return NextResponse.json({ ok: true });
}

/** Quick actions from the list: reorder, or show/hide. */
export async function PATCH(request: Request, ctx: Ctx) {
  const g = await guard(request, ctx);
  if (g instanceof NextResponse) return g;

  const body = (await readJson(request)) as { move?: unknown; visible?: unknown } | null;
  try {
    if (body && (body.move === "up" || body.move === "down")) {
      await moveFeaturedProject(g.id, body.move);
    } else if (body && typeof body.visible === "boolean") {
      await updateFeaturedProject(g.id, { visible: body.visible });
    } else {
      return NextResponse.json({ error: "Send { move: 'up' | 'down' } or { visible: boolean }." }, { status: 400 });
    }
  } catch (err) {
    return saveFailed(err);
  }
  revalidatePath("/");
  return NextResponse.json({ ok: true });
}

export async function DELETE(request: Request, ctx: Ctx) {
  const g = await guard(request, ctx);
  if (g instanceof NextResponse) return g;
  try {
    await deleteFeaturedProject(g.id);
  } catch (err) {
    return saveFailed(err);
  }
  revalidatePath("/");
  return NextResponse.json({ ok: true });
}
