import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { hasTrustedOrigin, requireAdmin } from "@/lib/session";
import { addFeaturedProject, getFeaturedProjects } from "@/lib/featured-projects-data";
import { MAX_PROJECTS, parseFeaturedProject } from "@/lib/featured-project-shared";

export async function GET() {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }
  return NextResponse.json(await getFeaturedProjects({ includeHidden: true }));
}

export async function POST(request: Request) {
  if (!hasTrustedOrigin(request)) {
    return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
  }
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const parsed = parseFeaturedProject(body);
  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  try {
    const id = await addFeaturedProject(parsed.value);
    revalidatePath("/");
    return NextResponse.json({ ok: true, id });
  } catch (err) {
    const limit = err instanceof Error && err.message.includes(`up to ${MAX_PROJECTS}`);
    if (!limit) console.error("featured project create failed", err);
    return NextResponse.json(
      { error: limit ? (err as Error).message : "Couldn't save right now. Please try again." },
      { status: limit ? 400 : 502 }
    );
  }
}
