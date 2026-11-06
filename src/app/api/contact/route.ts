import { NextResponse } from "next/server";
import { hasTrustedOrigin } from "@/lib/session";
import { getClientKey } from "@/lib/rate-limit";
import { isRateLimitedEdge } from "@/lib/rate-limit-edge";
import { parseContactInput } from "@/lib/messages-shared";
import { addMessage } from "@/lib/messages-data";
import { notifyNewMessage } from "@/lib/notify";

/** The public contact form. Saved in the admin inbox; bots (hidden field, link stuffing) get a silent "ok". */
export async function POST(request: Request) {
  if (!hasTrustedOrigin(request)) return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
  if (await isRateLimitedEdge(`contact:${getClientKey(request)}`, 6, 15 * 60)) return NextResponse.json({ error: "Too many messages. Please try again in a few minutes." }, { status: 429 });
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  const parsed = parseContactInput(body);
  if (!parsed.ok) return parsed.spam ? NextResponse.json({ ok: true }) : NextResponse.json({ error: parsed.error }, { status: 400 });
  try {
    await addMessage(parsed.value);
    notifyNewMessage(parsed.value);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("contact message save failed", err);
    return NextResponse.json({ error: "Couldn't send right now. Please try again, or use WhatsApp." }, { status: 502 });
  }
}
