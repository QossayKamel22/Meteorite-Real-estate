import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { hasTrustedOrigin, requireAdmin } from "@/lib/session";
import { getPosterSeries, savePosterSeries } from "@/lib/poster-series";
import { parsePosters } from "@/lib/poster-series-shared";

export async function GET() {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  return NextResponse.json({ items: await getPosterSeries() });
}

/** Replaces the whole list (add, remove and reorder all arrive as the new list). */
export async function PUT(request: Request) {
  if (!hasTrustedOrigin(request)) return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
  if (!(await requireAdmin())) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  const parsed = parsePosters(body);
  if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 });
  try {
    await savePosterSeries(parsed.value);
  } catch (err) {
    console.error("poster series save failed", err);
    return NextResponse.json({ error: "Couldn't save right now. Please try again." }, { status: 502 });
  }
  revalidatePath("/media");
  return NextResponse.json({ ok: true });
}
