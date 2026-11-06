import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/session";
import { listDocsPage } from "@/lib/firestore-rest";
import { BACKUP_COLLECTIONS } from "@/lib/backup-shared";

/** One page of one collection, for the admin's backup download. The browser stitches the pages together, so no single request has to hold the whole site. */
export async function GET(request: Request) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  const url = new URL(request.url);
  const c = BACKUP_COLLECTIONS.find((x) => x.name === url.searchParams.get("collection"));
  if (!c) return NextResponse.json({ error: "Unknown collection." }, { status: 400 });
  try {
    const page = await listDocsPage(c.name, { pageSize: c.pageSize, pageToken: url.searchParams.get("token") ?? undefined });
    return NextResponse.json(page, { headers: { "Cache-Control": "no-store" } });
  } catch (err) {
    console.error("backup page failed", err);
    return NextResponse.json({ error: "Couldn't read that part right now." }, { status: 502 });
  }
}
