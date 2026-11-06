import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { hasTrustedOrigin, requireAdmin } from "@/lib/session";
import { getProperties, addProperty, type PropertyInput } from "@/lib/properties-data";

const GALLERY_SRC = /^\/api\/img\/film\/[A-Za-z0-9_-]{1,64}$/;
function parseGallery(v: unknown): string[] | string {
  if (!Array.isArray(v)) return [];
  if (v.length > 10) return "Up to 10 extra photos.";
  const out: string[] = [];
  for (const x of v) {
    if (typeof x !== "string" || !GALLERY_SRC.test(x)) return "Each extra photo must be an uploaded image.";
    out.push(x);
  }
  return out;
}

function parsePropertyInput(body: Record<string, unknown>): PropertyInput | string {
  const title = typeof body.title === "string" ? body.title.trim() : "";
  const location = typeof body.location === "string" ? body.location.trim() : "";
  const type = typeof body.type === "string" ? body.type.trim() : "";
  const image = typeof body.image === "string" ? body.image.trim() : "";
  const purpose = body.purpose === "sale" || body.purpose === "rent" ? body.purpose : undefined;

  if (!title) return "Title is required.";
  if (!purpose) return "Purpose must be 'sale' or 'rent'.";
  if (!type) return "Property type is required.";
  if (!location) return "Location is required.";
  if (!image) return "Image is required.";

  const price = Number(body.price);
  if (!Number.isFinite(price) || price <= 0) return "Price must be a positive number.";

  const bedrooms = Number(body.bedrooms);
  if (!Number.isFinite(bedrooms) || bedrooms < 0) return "Bedrooms must be 0 or more.";

  const bathrooms = Number(body.bathrooms);
  if (!Number.isFinite(bathrooms) || bathrooms < 0) return "Bathrooms must be 0 or more.";

  const sizeSqft = Number(body.sizeSqft);
  if (!Number.isFinite(sizeSqft) || sizeSqft <= 0) return "Size must be a positive number.";

  const rentFrequency =
    body.rentFrequency === "yearly" || body.rentFrequency === "monthly" ? body.rentFrequency : undefined;
  const description =
    typeof body.description === "string" && body.description.trim() ? body.description.trim() : undefined;
  const amenities = Array.isArray(body.amenities)
    ? body.amenities.filter((a): a is string => typeof a === "string" && a.trim().length > 0)
    : undefined;
  const isStudio = body.isStudio === true;
  const gallery = parseGallery(body.gallery);
  if (typeof gallery === "string") return gallery;
  const visible = typeof body.visible === "boolean" ? body.visible : true;
  const sourceUrl =
    typeof body.sourceUrl === "string" && body.sourceUrl.trim() ? body.sourceUrl.trim() : undefined;

  return {
    title,
    purpose,
    price,
    type,
    location,
    image,
    ...(sourceUrl ? { sourceUrl } : {}),
    bedrooms,
    bathrooms,
    sizeSqft,
    isStudio,
    visible,
    gallery,
    ...(purpose === "rent" && rentFrequency ? { rentFrequency } : {}),
    ...(description ? { description } : {}),
    ...(amenities && amenities.length ? { amenities } : {}),
  };
}

export async function GET() {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }
  return NextResponse.json(await getProperties({ includeHidden: true }));
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

  const parsed = parsePropertyInput(body);
  if (typeof parsed === "string") {
    return NextResponse.json({ error: parsed }, { status: 400 });
  }

  const id = await addProperty(parsed);

  revalidatePath("/for-sale");
  revalidatePath("/for-rent");
  revalidatePath("/property/[id]", "page");

  return NextResponse.json({ ok: true, id });
}
