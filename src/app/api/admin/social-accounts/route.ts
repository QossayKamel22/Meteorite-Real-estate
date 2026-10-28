import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { hasTrustedOrigin, requireAdmin } from "@/lib/session";
import { getSocialAccounts, saveSocialAccounts } from "@/lib/social-accounts";
import { parseSocialAccounts } from "@/lib/reels-shared";

export async function GET() {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  return NextResponse.json(await getSocialAccounts());
}

export async function PUT(request: Request) {
  if (!hasTrustedOrigin(request)) return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
  if (!(await requireAdmin())) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  const parsed = parseSocialAccounts(body);
  if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 });
  try {
    await saveSocialAccounts(parsed.value);
  } catch (err) {
    console.error("social accounts save failed", err);
    return NextResponse.json({ error: "Couldn't save right now. Please try again." }, { status: 502 });
  }
  revalidatePath("/", "layout"); // the footer is on every page
  return NextResponse.json({ ok: true });
}
