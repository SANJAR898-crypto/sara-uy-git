import { NextResponse } from "next/server";
import { db } from "@/db";
import { stories, storyViews } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { handleApiError, jsonError } from "@/lib/api-utils";
import { anonymousViewerKey } from "@/lib/telegram-auth";
import { getSessionFromCookies } from "@/lib/session";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const storyId = Number(id);
    if (!Number.isFinite(storyId)) return jsonError("Noto'g'ri ID", 400);

    const session = await getSessionFromCookies();
    const fwd = req.headers.get("x-forwarded-for") ?? "anon";
    const viewerKey = session ? `u${session.userId}` : anonymousViewerKey(fwd);

    const inserted = await db
      .insert(storyViews)
      .values({ storyId, viewerKey })
      .onConflictDoNothing()
      .returning();

    if (inserted.length > 0) {
      await db
        .update(stories)
        .set({ viewsCount: sql`${stories.viewsCount} + 1` })
        .where(eq(stories.id, storyId));
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    return handleApiError(error);
  }
}
