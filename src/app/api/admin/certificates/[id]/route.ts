import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { hasTrustedOrigin, requireAdmin } from "@/lib/admin-auth";
import { updateCertificate, deleteCertificate, type CertificateInput } from "@/lib/certificates-data";

function parseCertificatePatch(body: Record<string, unknown>): Partial<CertificateInput> | string {
  if (typeof body.title === "string" && !body.title.trim()) return "Title cannot be empty.";
  if (typeof body.image === "string" && !body.image.trim()) return "Image URL cannot be empty.";

  const patch: Partial<CertificateInput> = {};
  if (typeof body.title === "string") patch.title = body.title.trim();
  if (typeof body.image === "string") patch.image = body.image.trim();
  if (typeof body.issuer === "string") patch.issuer = body.issuer.trim() || undefined;
  if (typeof body.licenseNo === "string") patch.licenseNo = body.licenseNo.trim() || undefined;
  if (typeof body.registrationDate === "string") {
    patch.registrationDate = body.registrationDate.trim() || undefined;
  }
  if (typeof body.expiryDate === "string") patch.expiryDate = body.expiryDate.trim() || undefined;
  if (Array.isArray(body.activities)) {
    patch.activities = body.activities.filter(
      (a): a is string => typeof a === "string" && a.trim().length > 0
    );
  }
  return patch;
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!hasTrustedOrigin(request)) {
    return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
  }
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { id } = await params;
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const parsed = parseCertificatePatch(body);
  if (typeof parsed === "string") {
    return NextResponse.json({ error: parsed }, { status: 400 });
  }

  await updateCertificate(id, parsed);

  revalidatePath("/about-us");

  return NextResponse.json({ ok: true });
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!hasTrustedOrigin(request)) {
    return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
  }
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { id } = await params;
  await deleteCertificate(id);

  revalidatePath("/about-us");

  return NextResponse.json({ ok: true });
}
