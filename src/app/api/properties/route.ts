import { NextResponse } from "next/server";
import { getProperties } from "@/lib/properties-data";
import { SAFE_DOC_ID } from "@/lib/image-url";

/** Public listings by id (for the saved-properties page). Only what the public pages already show. */
export async function GET(request: Request) {
  const ids = (new URL(request.url).searchParams.get("ids") ?? "").split(",").filter((x) => SAFE_DOC_ID.test(x)).slice(0, 40);
  if (ids.length === 0) return NextResponse.json({ items: [] });
  const all = await getProperties();
  const items = ids.map((id) => all.find((p) => p.id === id)).filter(Boolean);
  return NextResponse.json({ items }, { headers: { "Cache-Control": "no-store" } });
}
