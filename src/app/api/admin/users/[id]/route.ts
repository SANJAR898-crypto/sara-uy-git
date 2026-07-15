import { NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { handleApiError, jsonError } from "@/lib/api-utils";
import { requireAdmin } from "@/lib/auth-helpers";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    const { id } = await params;
    const userId = Number(id);
    if (!Number.isFinite(userId)) return jsonError("Noto'g'ri ID", 400);

    const body = await req.json();
    const patch: Partial<typeof users.$inferInsert> = {};
    if (typeof body.isBanned === "boolean") patch.isBanned = body.isBanned;
    if (typeof body.banReason === "string") patch.banReason = body.banReason;
    if (typeof body.isSeller === "boolean") patch.isSeller = body.isSeller;

    const [updated] = await db
      .update(users)
      .set({ ...patch, updatedAt: new Date() })
      .where(eq(users.id, userId))
      .returning();

    if (!updated) return jsonError("Foydalanuvchi topilmadi", 404);
    return NextResponse.json({ user: updated });
  } catch (error) {
    return handleApiError(error);
  }
}
