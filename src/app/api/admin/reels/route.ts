import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { hasTrustedOrigin, requireAdmin } from "@/lib/session";
import { addReel, getReels } from "@/lib/reels-data";
import { MAX_REELS, parseReelFields, parseReelUrl } from "@/lib/reels-shared";

/** Follows a share/short link (vm.tiktok.com, fb.watch, …) to the real address — only to hosts we know. */
async function resolveShortLink(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, {
      redirect: "follow",
      headers: { "User-Agent": "Mozilla/5.0 (compatible; MeteoriteBot/1.0)" },
      signal: AbortSignal.timeout(8000),
    });
    const final = res.url;
    await res.body?.cancel();
    return final && final !== url ? final.split("?")[0] : null;
  } catch {
    return null;
  }
}

export async function GET() {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  return NextResponse.json(await getReels({ includeHidden: true }));
}

export async function POST(request: Request) {
  if (!hasTrustedOrigin(request)) return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
  if (!(await requireAdmin())) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  // A short link is opened once on the server to learn the real address.
  if (typeof body.url === "string") {
    const first = parseReelUrl(body.url);
    if (!first.ok && first.resolve) {
      const real = await resolveShortLink(body.url.trim());
      if (real) body = { ...body, url: real };
    }
  }

  const parsed = parseReelFields(body);
  if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 });

  try {
    const id = await addReel(parsed.value);
    revalidatePath("/");
    return NextResponse.json({ ok: true, id });
  } catch (err) {
    const limit = err instanceof Error && err.message.includes(`up to ${MAX_REELS}`);
    if (!limit) console.error("reel create failed", err);
    return NextResponse.json({ error: limit ? (err as Error).message : "Couldn't save right now. Please try again." }, { status: limit ? 400 : 502 });
  }
}
