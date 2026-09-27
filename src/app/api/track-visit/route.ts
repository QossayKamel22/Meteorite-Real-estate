import { NextResponse } from "next/server";
import { hasTrustedOrigin } from "@/lib/session";
import { recordPageView } from "@/lib/analytics-data";

export async function POST(request: Request) {
  if (!hasTrustedOrigin(request)) {
    return NextResponse.json({ ok: false }, { status: 403 });
  }

  let path = "/";
  try {
    const body = (await request.json()) as { path?: string };
    if (typeof body.path === "string" && body.path.startsWith("/")) path = body.path;
  } catch {
    // no body — fall back to "/"
  }

  await recordPageView(path);
  return NextResponse.json({ ok: true });
}
