import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/session";
import { listUsers } from "@/lib/users-data";

export async function GET() {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }
  return NextResponse.json(await listUsers());
}
