import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { hasTrustedOrigin, requireAdmin } from "@/lib/session";
import { parseFaqSet, parseViewing } from "@/lib/site-settings-shared";
import { saveFaqs, saveViewingSettings } from "@/lib/site-settings";

/** Saves the FAQ lists and/or the viewing slots. Send `{ faq }` or `{ viewing }`. */
export async function PUT(request: Request) {
  if (!hasTrustedOrigin(request)) return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
  if (!(await requireAdmin())) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  const body = (await request.json().catch(() => null)) as { faq?: unknown; viewing?: unknown } | null;
  if (!body) return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  try {
    if (body.faq !== undefined) {
      const p = parseFaqSet(body.faq);
      if (!p.ok) return NextResponse.json({ error: p.error }, { status: 400 });
      await saveFaqs(p.value);
      revalidatePath("/for-sale");
      revalidatePath("/for-rent");
      revalidatePath("/contact-us");
    }
    if (body.viewing !== undefined) {
      const p = parseViewing(body.viewing);
      if (!p.ok) return NextResponse.json({ error: p.error }, { status: 400 });
      await saveViewingSettings(p.value);
      revalidatePath("/property/[id]", "page");
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("site settings save failed", err);
    return NextResponse.json({ error: "Couldn't save right now. Please try again." }, { status: 502 });
  }
}
