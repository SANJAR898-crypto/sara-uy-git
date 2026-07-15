import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getCurrentDbUser, toCurrentUser } from "@/lib/auth";
import { clearSessionCookie, getSession } from "@/lib/session";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getCurrentDbUser();
  if (!user) return NextResponse.json({ user: null }, { status: 200 });
  const currentUser = await toCurrentUser(user);
  return NextResponse.json({ user: currentUser });
}

export async function PATCH(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const patch: Partial<{ phone: string; role: "user" | "seller"; agencyName: string; isAgency: boolean }> = {};

  if (typeof body.phone === "string") patch.phone = body.phone;
  if (body.role === "seller" || body.role === "user") patch.role = body.role;
  if (typeof body.agencyName === "string") patch.agencyName = body.agencyName;
  if (typeof body.isAgency === "boolean") patch.isAgency = body.isAgency;

  const [updated] = await db.update(users).set(patch).where(eq(users.id, session.uid)).returning();
  const currentUser = await toCurrentUser(updated);
  return NextResponse.json({ user: currentUser });
}

export async function DELETE() {
  await clearSessionCookie();
  return NextResponse.json({ ok: true });
}
