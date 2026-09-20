import { NextResponse } from "next/server";
import { getSessionUser, hasTrustedOrigin } from "@/lib/session";
import { setUserDisabled, setUserRole } from "@/lib/users-data";

export async function PATCH(request: Request, { params }: { params: Promise<{ uid: string }> }) {
  if (!hasTrustedOrigin(request)) {
    return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
  }
  const session = await getSessionUser();
  if (!session?.admin) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { uid } = await params;

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  if (body.role !== undefined) {
    if (body.role !== "admin" && body.role !== "user") {
      return NextResponse.json({ error: "role must be 'admin' or 'user'." }, { status: 400 });
    }
    if (uid === session.uid && body.role !== "admin") {
      return NextResponse.json({ error: "You can't remove your own admin access." }, { status: 400 });
    }
    await setUserRole(uid, body.role);
  }

  if (body.disabled !== undefined) {
    if (typeof body.disabled !== "boolean") {
      return NextResponse.json({ error: "disabled must be a boolean." }, { status: 400 });
    }
    if (uid === session.uid && body.disabled) {
      return NextResponse.json({ error: "You can't disable your own account." }, { status: 400 });
    }
    await setUserDisabled(uid, body.disabled);
  }

  return NextResponse.json({ ok: true });
}
