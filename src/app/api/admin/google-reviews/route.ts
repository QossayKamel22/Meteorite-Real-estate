import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { hasTrustedOrigin, requireAdmin } from "@/lib/session";
import { getGoogleReviews, updateGoogleReviews } from "@/lib/google-reviews";
import { isGoogleUrl } from "@/lib/google-reviews-shared";

export async function GET() {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }
  return NextResponse.json(await getGoogleReviews());
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

  const url = typeof body.url === "string" ? body.url.trim() : "";
  if (!url || url.length > 800 || !isGoogleUrl(url)) {
    return NextResponse.json({ error: "Enter a valid https Google link (google.com, goo.gl or g.page)." }, { status: 400 });
  }

  const rating = Number(body.rating);
  if (!Number.isFinite(rating) || rating < 1 || rating > 5) {
    return NextResponse.json({ error: "Rating must be between 1 and 5." }, { status: 400 });
  }

  let count: number | null = null;
  if (body.count !== null && body.count !== undefined && body.count !== "") {
    const n = Number(body.count);
    if (!Number.isInteger(n) || n < 0 || n > 1_000_000) {
      return NextResponse.json({ error: "Review count must be a whole number (or left empty)." }, { status: 400 });
    }
    count = n;
  }

  await updateGoogleReviews({ url, rating: Math.round(rating * 10) / 10, count });
  revalidatePath("/");

  return NextResponse.json({ ok: true });
}
