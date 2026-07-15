import { NextResponse } from "next/server";
import { db } from "@/db";
import { stories } from "@/db/schema";
import { asc } from "drizzle-orm";
import { mapStory } from "@/lib/mappers";

export const dynamic = "force-dynamic";

export async function GET() {
  const rows = await db.select().from(stories).orderBy(asc(stories.sortOrder));
  return NextResponse.json({ stories: rows.map((r) => mapStory(r, false)) });
}
