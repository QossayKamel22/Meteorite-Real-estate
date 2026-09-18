import { NextResponse } from "next/server";
import { timingSafeEqual, createHash } from "crypto";
import {
  ADMIN_SESSION_COOKIE,
  ADMIN_SESSION_MAX_AGE,
  createAdminSessionToken,
  hasTrustedOrigin,
  isAdminConfigured,
} from "@/lib/admin-auth";
import { isRateLimited, clearRateLimit, getClientKey } from "@/lib/rate-limit";

function safeCompare(a: string, b: string): boolean {
  // Hash both first so the comparison is always fixed-length — comparing
  // raw buffers of different lengths would short-circuit before
  // timingSafeEqual and leak the expected password's length via timing.
  const hashA = createHash("sha256").update(a).digest();
  const hashB = createHash("sha256").update(b).digest();
  return timingSafeEqual(hashA, hashB);
}

export async function POST(request: Request) {
  if (!hasTrustedOrigin(request)) {
    return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
  }

  if (!isAdminConfigured()) {
    return NextResponse.json(
      { error: "Admin login is not configured on this deployment." },
      { status: 503 }
    );
  }

  const clientKey = getClientKey(request);
  if (isRateLimited(clientKey)) {
    return NextResponse.json(
      { error: "Too many attempts. Please try again later." },
      { status: 429 }
    );
  }

  let password: unknown;
  try {
    const body = await request.json();
    password = body?.password;
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  if (typeof password !== "string" || !password) {
    return NextResponse.json({ error: "Password is required." }, { status: 400 });
  }

  const expected = process.env.ADMIN_PASSWORD as string;
  if (!safeCompare(password, expected)) {
    return NextResponse.json({ error: "Incorrect password." }, { status: 401 });
  }

  clearRateLimit(clientKey);

  const token = await createAdminSessionToken();
  const response = NextResponse.json({ ok: true });
  response.cookies.set(ADMIN_SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: ADMIN_SESSION_MAX_AGE,
  });
  return response;
}
