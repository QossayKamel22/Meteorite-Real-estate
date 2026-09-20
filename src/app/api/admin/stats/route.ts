import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { hasTrustedOrigin, requireAdmin } from "@/lib/session";
import { STAT_FIELDS, getStats, updateStats, type SiteStats } from "@/lib/site-stats";

export async function GET() {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }
  return NextResponse.json(await getStats());
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

  const next = {} as SiteStats;
  for (const { key } of STAT_FIELDS) {
    const raw = body[key];
    const num = typeof raw === "number" ? raw : Number(raw);
    if (!Number.isFinite(num) || num < 0 || num > 1_000_000 || !Number.isInteger(num)) {
      return NextResponse.json(
        { error: `${key} must be a whole number between 0 and 1,000,000.` },
        { status: 400 }
      );
    }
    next[key] = num;
  }

  await updateStats(next);

  revalidatePath("/");
  revalidatePath("/about-us");
  revalidatePath("/payment");

  return NextResponse.json({ ok: true, stats: next });
}
