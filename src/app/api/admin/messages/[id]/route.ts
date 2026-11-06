import { NextResponse } from "next/server";
import { hasTrustedOrigin, requireAdmin } from "@/lib/session";
import { deleteMessage, setMessageRead } from "@/lib/messages-data";
import { SAFE_DOC_ID } from "@/lib/image-url";

type Ctx = { params: Promise<{ id: string }> };

async function guard(request: Request, ctx: Ctx): Promise<{ id: string } | NextResponse> {
  if (!hasTrustedOrigin(request)) return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
  if (!(await requireAdmin())) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  const { id } = await ctx.params;
  if (!SAFE_DOC_ID.test(id)) return NextResponse.json({ error: "Not found." }, { status: 404 });
  return { id };
}

export async function PATCH(request: Request, ctx: Ctx) {
  const g = await guard(request, ctx);
  if (g instanceof NextResponse) return g;
  const body = (await request.json().catch(() => ({}))) as { read?: unknown };
  if (typeof body.read !== "boolean") return NextResponse.json({ error: "Nothing to update." }, { status: 400 });
  try {
    await setMessageRead(g.id, body.read);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Couldn't save right now." }, { status: 502 });
  }
}

export async function DELETE(request: Request, ctx: Ctx) {
  const g = await guard(request, ctx);
  if (g instanceof NextResponse) return g;
  try {
    await deleteMessage(g.id);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Couldn't delete right now." }, { status: 502 });
  }
}
