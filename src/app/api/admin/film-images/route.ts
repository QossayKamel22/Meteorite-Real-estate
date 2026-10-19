import { NextResponse } from "next/server";
import { hasTrustedOrigin, requireAdmin } from "@/lib/session";
import { addDoc } from "@/lib/firestore-rest";

const DATA_IMAGE = /^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/]+=*$/;
const MAX_LENGTH = 450_000; // characters of the data URL (~330 KB of picture)

/**
 * Stores one uploaded project image (a JPEG/PNG/WebP data URL, already resized
 * in the browser) as its own document and returns the URL the site serves it
 * from. Kept apart from the project list so the list document stays small.
 */
export async function POST(request: Request) {
  if (!hasTrustedOrigin(request)) return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
  if (!(await requireAdmin())) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  let body: { image?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  const image = typeof body.image === "string" ? body.image.trim() : "";
  if (!DATA_IMAGE.test(image)) return NextResponse.json({ error: "Upload a JPG, PNG or WebP image." }, { status: 400 });
  if (image.length > MAX_LENGTH) return NextResponse.json({ error: "That image is too large. Try a smaller one." }, { status: 400 });

  try {
    const id = await addDoc("filmImages", { image, createdAt: new Date().toISOString() });
    return NextResponse.json({ ok: true, src: `/api/img/film/${id}` });
  } catch (err) {
    console.error("film image upload failed", err);
    return NextResponse.json({ error: "Couldn't save the image right now. Please try again." }, { status: 502 });
  }
}
