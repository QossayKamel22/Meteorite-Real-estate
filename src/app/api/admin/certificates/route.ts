import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { hasTrustedOrigin, requireAdmin } from "@/lib/admin-auth";
import { getCertificates, addCertificate, type CertificateInput } from "@/lib/certificates-data";

function parseCertificateInput(body: Record<string, unknown>): CertificateInput | string {
  const title = typeof body.title === "string" ? body.title.trim() : "";
  const image = typeof body.image === "string" ? body.image.trim() : "";

  if (!title) return "Title is required.";
  if (!image) return "Image URL is required.";

  const issuer = typeof body.issuer === "string" && body.issuer.trim() ? body.issuer.trim() : undefined;
  const licenseNo =
    typeof body.licenseNo === "string" && body.licenseNo.trim() ? body.licenseNo.trim() : undefined;
  const registrationDate =
    typeof body.registrationDate === "string" && body.registrationDate.trim()
      ? body.registrationDate.trim()
      : undefined;
  const expiryDate =
    typeof body.expiryDate === "string" && body.expiryDate.trim()
      ? body.expiryDate.trim()
      : undefined;
  const activities = Array.isArray(body.activities)
    ? body.activities.filter((a): a is string => typeof a === "string" && a.trim().length > 0)
    : undefined;

  return {
    title,
    image,
    ...(issuer ? { issuer } : {}),
    ...(licenseNo ? { licenseNo } : {}),
    ...(registrationDate ? { registrationDate } : {}),
    ...(expiryDate ? { expiryDate } : {}),
    ...(activities && activities.length ? { activities } : {}),
  };
}

export async function GET() {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }
  return NextResponse.json(await getCertificates());
}

export async function POST(request: Request) {
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

  const parsed = parseCertificateInput(body);
  if (typeof parsed === "string") {
    return NextResponse.json({ error: parsed }, { status: 400 });
  }

  const id = await addCertificate(parsed);

  revalidatePath("/about-us");

  return NextResponse.json({ ok: true, id });
}
