import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { hasTrustedOrigin, requireAdmin } from "@/lib/session";
import { getAgents, addAgent, type AgentInput } from "@/lib/agents-data";

function parseAgentInput(body: Record<string, unknown>): AgentInput | string {
  const name = typeof body.name === "string" ? body.name.trim() : "";
  const title = typeof body.title === "string" ? body.title.trim() : "";
  const photo = typeof body.photo === "string" ? body.photo.trim() : "";
  const email = typeof body.email === "string" ? body.email.trim() : "";

  if (!name) return "Name is required.";
  if (!title) return "Title is required.";
  if (!photo) return "Photo URL is required.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return "A valid email is required.";

  const phone = typeof body.phone === "string" && body.phone.trim() ? body.phone.trim() : undefined;
  const profileUrl =
    typeof body.profileUrl === "string" && body.profileUrl.trim()
      ? body.profileUrl.trim()
      : undefined;
  const bio = typeof body.bio === "string" && body.bio.trim() ? body.bio.trim() : undefined;
  const background =
    typeof body.background === "string" && body.background.trim()
      ? body.background.trim()
      : undefined;
  const credentials = Array.isArray(body.credentials)
    ? body.credentials.filter((c): c is string => typeof c === "string" && c.trim().length > 0)
    : undefined;

  return {
    name,
    title,
    photo,
    email,
    ...(phone ? { phone } : {}),
    ...(profileUrl ? { profileUrl } : {}),
    ...(bio ? { bio } : {}),
    ...(background ? { background } : {}),
    ...(credentials && credentials.length ? { credentials } : {}),
  };
}

export async function GET() {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }
  return NextResponse.json(await getAgents());
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

  const parsed = parseAgentInput(body);
  if (typeof parsed === "string") {
    return NextResponse.json({ error: parsed }, { status: 400 });
  }

  const id = await addAgent(parsed);

  revalidatePath("/");
  revalidatePath("/about-us");

  return NextResponse.json({ ok: true, id });
}
