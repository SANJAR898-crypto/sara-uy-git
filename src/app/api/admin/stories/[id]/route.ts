import { NextResponse } from "next/server";
import { db } from "@/db";
import { stories } from "@/db/schema";
import { eq } from "drizzle-orm";
import { handleApiError, jsonError } from "@/lib/api-utils";
import { requireAdmin } from "@/lib/auth-helpers";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    const { id } = await params;
    const storyId = Number(id);
    const body = await req.json();

    const patch: Partial<typeof stories.$inferInsert> = {};
    if (typeof body.isActive === "boolean") patch.isActive = body.isActive;
    if (typeof body.isFeatured === "boolean") patch.isFeatured = body.isFeatured;
    if (typeof body.sortOrder === "number") patch.sortOrder = body.sortOrder;

    const [updated] = await db.update(stories).set(patch).where(eq(stories.id, storyId)).returning();
    if (!updated) return jsonError("Story topilmadi", 404);
    return NextResponse.json({ story: updated });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    const { id } = await params;
    const storyId = Number(id);
    await db.delete(stories).where(eq(stories.id, storyId));
    return NextResponse.json({ ok: true });
  } catch (error) {
    return handleApiError(error);
  }
}
