import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { hasTrustedOrigin, requireAdmin } from "@/lib/session";
import {
  updateTestimonial,
  deleteTestimonial,
  moveTestimonial,
  type TestimonialInput,
} from "@/lib/testimonials-data";

function parseTestimonialPatch(body: Record<string, unknown>): Partial<TestimonialInput> | string {
  if (typeof body.name === "string" && !body.name.trim()) return "Name cannot be empty.";
  if (typeof body.role === "string" && !body.role.trim()) return "Role cannot be empty.";
  if (typeof body.quote === "string" && !body.quote.trim()) return "Quote cannot be empty.";

  const patch: Partial<TestimonialInput> = {};
  if (typeof body.name === "string") patch.name = body.name.trim();
  if (typeof body.role === "string") patch.role = body.role.trim();
  if (typeof body.quote === "string") patch.quote = body.quote.trim();
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

  const parsed = parseTestimonialPatch(body);
  if (typeof parsed === "string") {
    return NextResponse.json({ error: parsed }, { status: 400 });
  }

  await updateTestimonial(id, parsed);

  revalidatePath("/");

  return NextResponse.json({ ok: true });
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
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

  if (body.move !== "up" && body.move !== "down") {
    return NextResponse.json({ error: "move must be 'up' or 'down'." }, { status: 400 });
  }

  await moveTestimonial(id, body.move);

  revalidatePath("/");

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
  await deleteTestimonial(id);

  revalidatePath("/");

  return NextResponse.json({ ok: true });
}
