import { NextResponse } from "next/server";
import { getSessionUser, hasTrustedOrigin } from "@/lib/session";
import { getDoc, setDocMerge } from "@/lib/firestore-rest";
import { SAFE_DOC_ID } from "@/lib/image-url";

const MAX = 100;

/** The signed-in visitor's saved properties, so they follow the account from phone to laptop. */
export async function GET() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ ids: [] }, { status: 401 });
  const doc = await getDoc("favorites", user.uid);
  const ids = Array.isArray(doc?.data?.ids) ? (doc!.data.ids as unknown[]).filter((x): x is string => typeof x === "string" && SAFE_DOC_ID.test(x)) : [];
  return NextResponse.json({ ids });
}

export async function PUT(request: Request) {
  if (!hasTrustedOrigin(request)) return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Sign in to sync." }, { status: 401 });
  const body = (await request.json().catch(() => ({}))) as { ids?: unknown };
  if (!Array.isArray(body.ids)) return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  const ids = [...new Set(body.ids.filter((x): x is string => typeof x === "string" && SAFE_DOC_ID.test(x)))].slice(0, MAX);
  try {
    await setDocMerge("favorites", user.uid, { ids, updatedAt: new Date().toISOString() });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Couldn't save right now." }, { status: 502 });
  }
}
