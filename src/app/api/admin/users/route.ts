import { NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { desc } from "drizzle-orm";
import { handleApiError } from "@/lib/api-utils";
import { requireAdmin } from "@/lib/auth-helpers";

export async function GET() {
  try {
    await requireAdmin();
    const items = await db.select().from(users).orderBy(desc(users.createdAt));
    return NextResponse.json({ items });
  } catch (error) {
    return handleApiError(error);
  }
}
