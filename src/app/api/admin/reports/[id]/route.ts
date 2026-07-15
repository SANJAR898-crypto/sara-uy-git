import { NextResponse } from "next/server";
import { db } from "@/db";
import { reports } from "@/db/schema";
import { eq } from "drizzle-orm";
import { handleApiError, jsonError } from "@/lib/api-utils";
import { requireAdmin } from "@/lib/auth-helpers";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    const { id } = await params;
    const reportId = Number(id);
    const body = await req.json();

    const patch: Partial<typeof reports.$inferInsert> = {};
    if (typeof body.status === "string") patch.status = body.status;
    if (typeof body.adminNotes === "string") patch.adminNotes = body.adminNotes;

    const [updated] = await db.update(reports).set(patch).where(eq(reports.id, reportId)).returning();
    if (!updated) return jsonError("Topilmadi", 404);
    return NextResponse.json({ report: updated });
  } catch (error) {
    return handleApiError(error);
  }
}
