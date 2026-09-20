import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { hasTrustedOrigin, requireAdmin } from "@/lib/session";
import { getTestimonials, addTestimonial, type TestimonialInput } from "@/lib/testimonials-data";

function parseTestimonialInput(body: Record<string, unknown>): TestimonialInput | string {
  const name = typeof body.name === "string" ? body.name.trim() : "";
  const role = typeof body.role === "string" ? body.role.trim() : "";
  const quote = typeof body.quote === "string" ? body.quote.trim() : "";

  if (!name) return "Name is required.";
  if (!role) return "Role is required.";
  if (!quote) return "Quote is required.";

  const visible = typeof body.visible === "boolean" ? body.visible : true;

  return { name, role, quote, visible };
}

export async function GET() {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }
  return NextResponse.json(await getTestimonials({ includeHidden: true }));
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

  const parsed = parseTestimonialInput(body);
  if (typeof parsed === "string") {
    return NextResponse.json({ error: parsed }, { status: 400 });
  }

  const id = await addTestimonial(parsed);

  revalidatePath("/");

  return NextResponse.json({ ok: true, id });
}
