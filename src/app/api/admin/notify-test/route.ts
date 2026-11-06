import { NextResponse } from "next/server";
import { hasTrustedOrigin, requireAdmin } from "@/lib/session";
import { notifyChannels, notifyNewMessage } from "@/lib/notify";

/** Sends a clearly-labelled test notification (nothing is stored in the inbox) so the setup can be checked. */
export async function POST(request: Request) {
  if (!hasTrustedOrigin(request)) return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
  if (!(await requireAdmin())) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  const ch = notifyChannels();
  if (!ch.telegram && !ch.email) return NextResponse.json({ error: "No channel is set up yet." }, { status: 400 });
  notifyNewMessage({ name: "TEST — notification check", email: "test@example.com", phone: "", topic: "Test", message: "If you can read this, new enquiries will reach you here.", source: "", viewing: "" });
  return NextResponse.json({ ok: true, ...ch });
}
