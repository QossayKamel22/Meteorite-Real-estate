import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { hasTrustedOrigin, requireAdmin } from "@/lib/session";
import { updateProperty, deleteProperty, moveProperty, type PropertyInput } from "@/lib/properties-data";

function parsePropertyPatch(body: Record<string, unknown>): Partial<PropertyInput> | string {
  const patch: Partial<PropertyInput> = {};

  if (typeof body.title === "string") {
    if (!body.title.trim()) return "Title cannot be empty.";
    patch.title = body.title.trim();
  }
  if (body.purpose !== undefined) {
    if (body.purpose !== "sale" && body.purpose !== "rent") return "Purpose must be 'sale' or 'rent'.";
    patch.purpose = body.purpose;
  }
  if (typeof body.type === "string") {
    if (!body.type.trim()) return "Property type cannot be empty.";
    patch.type = body.type.trim();
  }
  if (typeof body.location === "string") {
    if (!body.location.trim()) return "Location cannot be empty.";
    patch.location = body.location.trim();
  }
  if (typeof body.image === "string") {
    if (!body.image.trim()) return "Image cannot be empty.";
    patch.image = body.image.trim();
  }
  if (body.price !== undefined) {
    const price = Number(body.price);
    if (!Number.isFinite(price) || price <= 0) return "Price must be a positive number.";
    patch.price = price;
  }
  if (body.bedrooms !== undefined) {
    const bedrooms = Number(body.bedrooms);
    if (!Number.isFinite(bedrooms) || bedrooms < 0) return "Bedrooms must be 0 or more.";
    patch.bedrooms = bedrooms;
  }
  if (body.bathrooms !== undefined) {
    const bathrooms = Number(body.bathrooms);
    if (!Number.isFinite(bathrooms) || bathrooms < 0) return "Bathrooms must be 0 or more.";
    patch.bathrooms = bathrooms;
  }
  if (body.sizeSqft !== undefined) {
    const sizeSqft = Number(body.sizeSqft);
    if (!Number.isFinite(sizeSqft) || sizeSqft <= 0) return "Size must be a positive number.";
    patch.sizeSqft = sizeSqft;
  }
  if (body.rentFrequency === "yearly" || body.rentFrequency === "monthly") {
    patch.rentFrequency = body.rentFrequency;
  }
  if (typeof body.description === "string") patch.description = body.description.trim() || undefined;
  if (Array.isArray(body.amenities)) {
    patch.amenities = body.amenities.filter((a): a is string => typeof a === "string" && a.trim().length > 0);
  }
  if (typeof body.isStudio === "boolean") patch.isStudio = body.isStudio;
  if (typeof body.visible === "boolean") patch.visible = body.visible;
  if (typeof body.sourceUrl === "string") patch.sourceUrl = body.sourceUrl.trim() || undefined;

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

  const parsed = parsePropertyPatch(body);
  if (typeof parsed === "string") {
    return NextResponse.json({ error: parsed }, { status: 400 });
  }

  await updateProperty(id, parsed);

  revalidatePath("/for-sale");
  revalidatePath("/for-rent");

  return NextResponse.json({ ok: true });
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
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

  if (body.move !== "up" && body.move !== "down") {
    return NextResponse.json({ error: "move must be 'up' or 'down'." }, { status: 400 });
  }

  await moveProperty(id, body.move);

  revalidatePath("/for-sale");
  revalidatePath("/for-rent");

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
  await deleteProperty(id);

  revalidatePath("/for-sale");
  revalidatePath("/for-rent");

  return NextResponse.json({ ok: true });
}
