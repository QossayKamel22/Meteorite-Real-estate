import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { hasTrustedOrigin, requireAdmin } from "@/lib/session";
import { getCeoMessage, updateCeoMessage } from "@/lib/ceo-message";
import { CEO_MESSAGE_MAX_WORDS, countWords } from "@/lib/ceo-message-shared";

export async function GET() {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }
  return NextResponse.json(await getCeoMessage());
}

export async function PUT(request: Request) {
  if (!hasTrustedOrigin(request)) {
    return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
  }
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const text = typeof body.text === "string" ? body.text.replace(/\r\n/g, "\n").trim() : "";
  const signerTitle = typeof body.signerTitle === "string" ? body.signerTitle.trim() : "";
  const company = typeof body.company === "string" ? body.company.trim() : "";

  if (!text) return NextResponse.json({ error: "Message cannot be empty." }, { status: 400 });
  if (countWords(text) > CEO_MESSAGE_MAX_WORDS) {
    return NextResponse.json(
      { error: `Message must be ${CEO_MESSAGE_MAX_WORDS} words or fewer.` },
      { status: 400 }
    );
  }
  if (signerTitle.length > 60 || company.length > 80) {
    return NextResponse.json({ error: "Signature is too long." }, { status: 400 });
  }

  await updateCeoMessage({ text, signerTitle, company });
  revalidatePath("/");

  return NextResponse.json({ ok: true });
}

/** Removes the message from the homepage (an empty text hides the section). */
export async function DELETE(request: Request) {
  if (!hasTrustedOrigin(request)) {
    return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
  }
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  await updateCeoMessage({ text: "" });
  revalidatePath("/");

  return NextResponse.json({ ok: true });
}
