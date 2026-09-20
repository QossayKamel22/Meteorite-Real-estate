import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { hasTrustedOrigin, requireAdmin } from "@/lib/session";
import { getHomepageContent, updateHomepageContent } from "@/lib/homepage-content";

const MAX_LENGTHS = { heroBadge: 80, heroHeadline: 120, heroSubheadline: 320 } as const;

export async function GET() {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }
  return NextResponse.json(await getHomepageContent());
}

export async function PUT(request: Request) {
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

  const patch: Record<string, string> = {};
  for (const key of Object.keys(MAX_LENGTHS) as (keyof typeof MAX_LENGTHS)[]) {
    const raw = body[key];
    if (raw === undefined) continue;
    if (typeof raw !== "string" || !raw.trim()) {
      return NextResponse.json({ error: `${key} cannot be empty.` }, { status: 400 });
    }
    if (raw.length > MAX_LENGTHS[key]) {
      return NextResponse.json(
        { error: `${key} must be ${MAX_LENGTHS[key]} characters or fewer.` },
        { status: 400 }
      );
    }
    patch[key] = raw.trim();
  }

  await updateHomepageContent(patch);

  revalidatePath("/");

  return NextResponse.json({ ok: true });
}
