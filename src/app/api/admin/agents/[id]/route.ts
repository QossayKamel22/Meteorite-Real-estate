import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { hasTrustedOrigin, requireAdmin } from "@/lib/session";
import { updateAgent, deleteAgent, type AgentInput } from "@/lib/agents-data";

function parseAgentPatch(body: Record<string, unknown>): Partial<AgentInput> | string {
  if (typeof body.name === "string" && !body.name.trim()) return "Name cannot be empty.";
  if (typeof body.title === "string" && !body.title.trim()) return "Title cannot be empty.";
  if (typeof body.photo === "string" && !body.photo.trim()) return "Photo URL cannot be empty.";
  if (typeof body.email === "string" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email.trim())) {
    return "A valid email is required.";
  }

  const patch: Partial<AgentInput> = {};
  if (typeof body.name === "string") patch.name = body.name.trim();
  if (typeof body.title === "string") patch.title = body.title.trim();
  if (typeof body.photo === "string") patch.photo = body.photo.trim();
  if (typeof body.email === "string") patch.email = body.email.trim();
  if (typeof body.phone === "string") patch.phone = body.phone.trim() || undefined;
  if (typeof body.profileUrl === "string") patch.profileUrl = body.profileUrl.trim() || undefined;
  if (typeof body.bio === "string") patch.bio = body.bio.trim() || undefined;
  if (typeof body.background === "string") patch.background = body.background.trim() || undefined;
  if (Array.isArray(body.credentials)) {
    patch.credentials = body.credentials.filter(
      (c): c is string => typeof c === "string" && c.trim().length > 0
    );
  }
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

  const parsed = parseAgentPatch(body);
  if (typeof parsed === "string") {
    return NextResponse.json({ error: parsed }, { status: 400 });
  }

  await updateAgent(id, parsed);

  revalidatePath("/");
  revalidatePath("/about-us");

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
  await deleteAgent(id);

  revalidatePath("/");
  revalidatePath("/about-us");

  return NextResponse.json({ ok: true });
}
